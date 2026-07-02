#!/usr/bin/env node
/**
 * verify-install.mjs
 * Parity check: runs the manifest-driven skills/hooks install logic from install.sh
 * (via bash) and install.ps1 (via pwsh) against the extracted dist/release.zip and
 * asserts both produce identical installed directory trees.
 *
 * Requires: bash and pwsh on PATH (GitHub-hosted ubuntu-latest runners have both).
 * Run after `npm run release`.
 */
import {
  existsSync, mkdirSync, mkdtempSync, rmSync, readdirSync, statSync,
  writeFileSync,
} from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ZIP_PATH = join(ROOT, 'dist', 'release.zip');

// ── preflight: check required executables ─────────────────────────────────────

function checkExec(name) {
  const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name]);
  return result.status === 0;
}

if (!checkExec('bash')) {
  console.error('bash not found — required to verify install.sh');
  process.exit(1);
}
if (!checkExec('pwsh')) {
  console.error('pwsh not found — required to verify install.ps1');
  process.exit(1);
}

if (!existsSync(ZIP_PATH)) {
  console.error('dist/release.zip not found — run npm run release first');
  process.exit(1);
}

// ── extract zip ────────────────────────────────────────────────────────────────

const workDir = mkdtempSync(join(tmpdir(), 'verify-install-'));

try {
  const extractDir = join(workDir, 'zip');
  mkdirSync(extractDir);
  execSync(`cd "${extractDir}" && unzip -q "${ZIP_PATH}"`, { shell: true });

  // ── bash harness: same manifest routing logic as install.sh ─────────────────
  // This is the skills/hooks section of install.sh, parametrized for testing.
  const bashHarness = `#!/usr/bin/env bash
set -euo pipefail
EXTRACTED_DIR="$1"
INSTALL_DIR="$2"
SKILLS_DIR="\${INSTALL_DIR}/.claude/skills"
HOOKS_DIR="\${INSTALL_DIR}/user-hooks"
PROJECT_HOOKS_DIR="\${INSTALL_DIR}/.claude/hooks"
mkdir -p "\$SKILLS_DIR" "\$HOOKS_DIR" "\$PROJECT_HOOKS_DIR"
cd "\$EXTRACTED_DIR"
if [[ -f manifest.json ]]; then
  while IFS=$'\\t' read -r dest_path install_subpath; do
    mkdir -p "\$SKILLS_DIR/\$(dirname "\$install_subpath")"
    cp -r "\$dest_path" "\$SKILLS_DIR/\$install_subpath"
  done < <(python3 -c "
import json
m = json.load(open('manifest.json'))
for e in m['skills']:
    install_subpath = e['dest'][len('skills/'):]
    print(e['dest'] + '\\t' + install_subpath)
")
  while IFS=$'\\t' read -r dest_path scope name; do
    if [[ "\$scope" == "project" ]]; then
      cp "\$dest_path" "\$PROJECT_HOOKS_DIR/\$name"
    else
      cp "\$dest_path" "\$HOOKS_DIR/\$name"
    fi
  done < <(python3 -c "
import json
m = json.load(open('manifest.json'))
for e in m['hooks']:
    print(e['dest'] + '\\t' + e['scope'] + '\\t' + e['name'])
")
fi
`;

  // ── pwsh harness: same manifest routing logic as install.ps1 ────────────────
  const pwshHarness = `param([string]$ExtractedDir, [string]$InstallDir)
$SkillsDir       = "$InstallDir\\.claude\\skills"
$HooksDir        = "$InstallDir\\user-hooks"
$ProjectHooksDir = "$InstallDir\\.claude\\hooks"
New-Item -ItemType Directory -Path $SkillsDir       -Force | Out-Null
New-Item -ItemType Directory -Path $HooksDir        -Force | Out-Null
New-Item -ItemType Directory -Path $ProjectHooksDir -Force | Out-Null
Set-Location $ExtractedDir
$ManifestPath = Join-Path $ExtractedDir "manifest.json"
if (Test-Path $ManifestPath) {
    $manifest = Get-Content $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($entry in $manifest.skills) {
        $installSubpath = $entry.dest.Substring("skills/".Length).Replace("/", "\\")
        $src = Join-Path $ExtractedDir $entry.dest.Replace("/", "\\")
        $dst = Join-Path $SkillsDir $installSubpath
        New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    }
    foreach ($entry in $manifest.hooks) {
        $src = Join-Path $ExtractedDir $entry.dest.Replace("/", "\\")
        if ($entry.scope -eq "project") {
            $dst = Join-Path $ProjectHooksDir $entry.name
        } else {
            $dst = Join-Path $HooksDir $entry.name
        }
        Copy-Item -Path $src -Destination $dst -Force
    }
}
`;

  const bashScript = join(workDir, 'install-harness.sh');
  const pwshScript = join(workDir, 'install-harness.ps1');
  writeFileSync(bashScript, bashHarness, { mode: 0o755 });
  writeFileSync(pwshScript, pwshHarness);

  // ── run bash harness ──────────────────────────────────────────────────────────

  const shDir = join(workDir, 'sh-install');
  mkdirSync(shDir);
  console.log('Running bash install harness...');
  execSync(`bash "${bashScript}" "${extractDir}" "${shDir}"`, { stdio: 'inherit' });

  // ── run pwsh harness ──────────────────────────────────────────────────────────

  const ps1Dir = join(workDir, 'ps1-install');
  mkdirSync(ps1Dir);
  console.log('Running pwsh install harness...');
  execSync(`pwsh -NoProfile -File "${pwshScript}" -ExtractedDir "${extractDir}" -InstallDir "${ps1Dir}"`, { stdio: 'inherit' });

  // ── collect file trees ────────────────────────────────────────────────────────

  function collectTree(dir) {
    const paths = [];
    if (!existsSync(dir)) return paths;
    function walk(cur) {
      for (const entry of readdirSync(cur).sort()) {
        const full = join(cur, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else {
          paths.push(relative(dir, full));
        }
      }
    }
    walk(dir);
    return paths;
  }

  const shTree = collectTree(shDir);
  const ps1Tree = collectTree(ps1Dir);
  const shSet = new Set(shTree);
  const ps1Set = new Set(ps1Tree);
  const onlyInSh = shTree.filter(p => !ps1Set.has(p));
  const onlyInPs1 = ps1Tree.filter(p => !shSet.has(p));

  rmSync(workDir, { recursive: true });

  if (onlyInSh.length === 0 && onlyInPs1.length === 0) {
    console.log(`\n✓ install.sh and install.ps1 produce identical directory trees (${shTree.length} paths)`);
    process.exit(0);
  }

  console.error('\n✗ installer parity check FAILED — trees differ:');
  for (const p of onlyInSh) {
    console.error(`  only in sh:  ${p}`);
  }
  for (const p of onlyInPs1) {
    console.error(`  only in ps1: ${p}`);
  }
  process.exit(1);
} catch (e) {
  rmSync(workDir, { recursive: true, force: true });
  console.error('verify-install failed:', e.message);
  process.exit(1);
}
