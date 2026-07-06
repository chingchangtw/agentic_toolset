#!/usr/bin/env bash
# install.sh — agenticToolset installer (macOS / Linux / Git Bash / WSL)
# Usage:
#   curl -fsSL https://github.com/OWNER/REPO/releases/latest/download/install.sh | bash
#   GITHUB_TOKEN=ghp_xxx bash install.sh   # for private repos

set -euo pipefail

# ── python interpreter resolution ──────────────────────────────────────────
# A bare "python3" on PATH can be broken (wrong arch, stale conda env, etc.)
# and gets SIGKILL'd with no diagnostics — the failure this fix addresses.
# Probe candidates and pick the first one that actually runs.
PYTHON_BIN=""
for candidate in python3 /usr/bin/python3 /usr/local/bin/python3 python; do
  if command -v "${candidate}" >/dev/null 2>&1 && "${candidate}" -c "" >/dev/null 2>&1; then
    PYTHON_BIN="${candidate}"
    break
  fi
done
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "✗ No working python3 interpreter found on PATH. Install Python 3 and retry." >&2
  exit 1
fi

REPO="chingchangtw/agentic_toolset"
RELEASE_URL="https://github.com/${REPO}/releases/latest/download/release.zip"
CLAUDE_DIR="${HOME}/.claude"
PROJECT_DIR=$(pwd)
PROJECT_CLAUDE_DIR="${PROJECT_DIR}/.claude"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
PROJECT_HOOKS_DIR="${PROJECT_CLAUDE_DIR}/hooks"
SKILLS_DIR="${PROJECT_CLAUDE_DIR}/skills"
SETTINGS="${CLAUDE_DIR}/settings.json"
PROJECT_SETTINGS="${PROJECT_CLAUDE_DIR}/settings.json"
TMPDIR_INSTALL="$(mktemp -d)"

# ── download (or local zip override) ──────────────────────────────────────────
# ZIP_FILE=/path/to/release.zip skips the GitHub download and installs from a
# locally built zip — used by the pilot harness and dogfood release rehearsal.

if [[ -n "${ZIP_FILE:-}" ]]; then
  echo "→ Using local zip: ${ZIP_FILE}"
  cp "${ZIP_FILE}" "${TMPDIR_INSTALL}/release.zip"
else
  echo "→ Downloading release..."
  CURL_ARGS=(-fsSL --output "${TMPDIR_INSTALL}/release.zip")
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    CURL_ARGS+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi
  curl "${CURL_ARGS[@]}" "${RELEASE_URL}"
fi

cd "${TMPDIR_INSTALL}"
unzip -q release.zip

# ── skills & hooks (manifest-driven, or legacy fallback for old zips) ─────────

if [[ -f manifest.json ]]; then

  # ── skills, hooks, agents (manifest-driven; one tagged pass) ──────────────────
  # Directories are created up front, once, before any row is processed —
  # a fresh install with no pre-existing dirs must not break on the first cp.
  # Header lines print together, up front, in skill/hook/agent order (today's
  # 3 separate loops print each header immediately before that category's
  # entries; a single merged loop cannot preserve that exact interleaving
  # without a header-shown flag per tag that would silently vanish for an
  # empty category — accepted, reviewed tradeoff: same header text, grouped
  # earlier instead of interleaved).

  echo "→ Installing skills → ${SKILLS_DIR}/"
  echo "→ Installing hooks..."
  echo "→ Installing agents → ${PROJECT_CLAUDE_DIR}/agents/"
  mkdir -p "${SKILLS_DIR}"
  mkdir -p "${HOOKS_DIR}"
  mkdir -p "${PROJECT_HOOKS_DIR}"
  mkdir -p "${PROJECT_CLAUDE_DIR}/agents"

  while IFS=$'\t' read -r tag f1 f2 f3; do
    case "${tag}" in
      skill)
        mkdir -p "${SKILLS_DIR}/$(dirname "${f2}")"
        cp -r "${f1}" "${SKILLS_DIR}/${f2}"
        echo "   ✓ skill: ${f2}"
        ;;
      hook)
        if [[ "${f2}" == "project" ]]; then
          target_dir="${PROJECT_HOOKS_DIR}"
        else
          target_dir="${HOOKS_DIR}"
        fi
        cp "${f1}" "${target_dir}/${f3}"
        chmod +x "${target_dir}/${f3}"
        echo "   ✓ hook (${f2}): ${f3}"
        ;;
      agent)
        [[ -z "${f1}" ]] && continue
        cp "${f1}" "${PROJECT_CLAUDE_DIR}/agents/${f2}.md"
        echo "   ✓ agent: ${f2}"
        ;;
      *)
        echo "unknown manifest category tag: ${tag}" >&2
        exit 1
        ;;
    esac
  done < <("${PYTHON_BIN}" -c "
import json
m = json.load(open('manifest.json'))
for e in m['skills']:
    install_subpath = e['dest'][len('skills/'):]
    print('skill\t' + e['dest'] + '\t' + install_subpath)
for e in m['hooks']:
    print('hook\t' + e['dest'] + '\t' + e['scope'] + '\t' + e['name'])
for e in m.get('agents', []):
    print('agent\t' + e['dest'] + '\t' + e['name'])
")

else

  # ── legacy fallback: old zip without manifest.json ────────────────────────────

  echo "→ Installing skills → ${SKILLS_DIR}/"
  mkdir -p "${SKILLS_DIR}"
  if [[ -d skills ]]; then
    for skill_dir in skills/*/; do
      name="$(basename "${skill_dir}")"
      if [[ "${name}" == "ondemand" ]]; then
        mkdir -p "${SKILLS_DIR}/ondemand"
        for ondemand_dir in "${skill_dir}"*/; do
          [[ -d "${ondemand_dir}" ]] || continue
          od_name="$(basename "${ondemand_dir}")"
          cp -r "${ondemand_dir}" "${SKILLS_DIR}/ondemand/${od_name}"
          echo "   ✓ skill (ondemand): ${od_name}"
        done
        continue
      fi
      cp -r "${skill_dir}" "${SKILLS_DIR}/${name}"
      echo "   ✓ skill: ${name}"
    done
  fi

  echo "→ Installing hooks → ${HOOKS_DIR}/"
  mkdir -p "${HOOKS_DIR}"
  if [[ -d hook ]]; then
    cp hook/ts-session-guard.py    "${HOOKS_DIR}/ts-session-guard.py"
    cp hook/ts-statusline_bridge.py "${HOOKS_DIR}/ts-statusline_bridge.py"
    chmod +x "${HOOKS_DIR}/ts-session-guard.py"
    chmod +x "${HOOKS_DIR}/ts-statusline_bridge.py"
    echo "   ✓ ts-session-guard.py"
    echo "   ✓ ts-statusline_bridge.py"
  fi

  echo "→ Installing project hook → ${PROJECT_HOOKS_DIR}/"
  mkdir -p "${PROJECT_HOOKS_DIR}"
  if [[ -d hook && -f hook/inject-workflow-state.sh ]]; then
    cp hook/inject-workflow-state.sh "${PROJECT_HOOKS_DIR}/inject-workflow-state.sh"
    chmod +x "${PROJECT_HOOKS_DIR}/inject-workflow-state.sh"
    echo "   ✓ inject-workflow-state.sh"
  fi

fi

# ── commands ──────────────────────────────────────────────────────────────────

if [[ -d commands ]]; then
  echo "→ Installing commands → ${PROJECT_CLAUDE_DIR}/commands/"
  mkdir -p "${PROJECT_CLAUDE_DIR}/commands"
  cp -r commands/. "${PROJECT_CLAUDE_DIR}/commands/"
  echo "   ✓ commands installed"
fi

# ── version marker ────────────────────────────────────────────────────────────
# Legacy zips without releaseVersion install without a marker (no failure).

if [[ -f manifest.json ]]; then
  release_version="$("${PYTHON_BIN}" -c "
import json
m = json.load(open('manifest.json'))
print(m.get('releaseVersion', ''))
")"
  if [[ -n "${release_version}" ]]; then
    mkdir -p "${PROJECT_CLAUDE_DIR}"
    printf '%s\n' "${release_version}" > "${PROJECT_CLAUDE_DIR}/.toolset-version"
    echo "   ✓ version marker: ${release_version}"
  fi
fi

# ── project settings.json (UserPromptSubmit hook registration) ─────────────────

echo "→ Patching ${PROJECT_SETTINGS}"
mkdir -p "${PROJECT_CLAUDE_DIR}"

"${PYTHON_BIN}" - "${PROJECT_SETTINGS}" << 'PYEOF2'
import json, sys
from pathlib import Path

settings_path = Path(sys.argv[1])

settings = {}
if settings_path.exists():
    try:
        settings = json.loads(settings_path.read_text(encoding="utf-8"))
    except Exception:
        pass

hook_cmd = 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/inject-workflow-state.sh"'
hooks = settings.setdefault("hooks", {})
ups   = hooks.setdefault("UserPromptSubmit", [])

already = any(
    hook.get("command") == hook_cmd
    for entry in ups
    for hook in entry.get("hooks", [])
)
if not already:
    ups.append({"hooks": [{"type": "command", "command": hook_cmd}]})

settings_path.write_text(
    json.dumps(settings, indent=2, ensure_ascii=False),
    encoding="utf-8"
)
print("   ✓ project settings.json patched")
PYEOF2

# ── settings.json ─────────────────────────────────────────────────────────────

echo "→ Patching ${SETTINGS}"
mkdir -p "${CLAUDE_DIR}"

"${PYTHON_BIN}" - "${SETTINGS}" "${HOOKS_DIR}" << 'PYEOF'
import json, sys, os
from pathlib import Path

settings_path = Path(sys.argv[1])
hooks_dir     = sys.argv[2]

settings = {}
if settings_path.exists():
    try:
        settings = json.loads(settings_path.read_text(encoding="utf-8"))
    except Exception:
        pass

# ── UserPromptSubmit hook ────────────────────────────────────────────────────
# Pin to the interpreter running this installer, not bare "python3" — on
# machines with a broken/mismatched-arch python3 earlier on PATH (e.g. a
# leftover x86_64 miniconda python3 on Apple Silicon under Rosetta), a bare
# "python3" hook command gets SIGKILL'd with no stdout/stderr, which Claude
# Code reports as "Failed with non-blocking status code: No stderr output".
hook_cmd = f'"{sys.executable}" "{hooks_dir}/ts-session-guard.py"'
hooks = settings.setdefault("hooks", {})
ups   = hooks.setdefault("UserPromptSubmit", [])

# Check if already registered (idempotent). Match on the script path, not the
# full command string — an exact-string match would re-append a duplicate
# every time the interpreter path changes (e.g. after this fix), which is how
# a stale bare-"python3" entry and an absolute-path entry ended up coexisting.
existing_hooks = [
    hook
    for entry in ups
    for hook in entry.get("hooks", [])
    if "ts-session-guard.py" in hook.get("command", "")
]
if existing_hooks:
    existing_hooks[0]["command"] = hook_cmd
    for entry in list(ups):
        entry["hooks"] = [
            h for h in entry.get("hooks", [])
            if "ts-session-guard.py" not in h.get("command", "") or h is existing_hooks[0]
        ]
    ups[:] = [entry for entry in ups if entry.get("hooks")]
else:
    ups.append({"hooks": [{"type": "command", "command": hook_cmd}]})

# ── statusLine ───────────────────────────────────────────────────────────────
# Schema: statusLine must be an object {"type": "command", "command": "..."},
# not a bare string — Claude Code rejects the whole settings file otherwise.
bridge_cmd  = f'"{sys.executable}" "{hooks_dir}/ts-statusline_bridge.py"'
existing_sl = settings.get("statusLine")

# Existing value may be a legacy bare string or the {"type","command"} object.
existing_cmd = None
if isinstance(existing_sl, str) and existing_sl:
    existing_cmd = existing_sl
elif isinstance(existing_sl, dict):
    existing_cmd = existing_sl.get("command")

wrapper_path = Path(hooks_dir) / "statusline_wrapper.sh"
already_wrapped = (
    "ts-statusline_bridge.py" in (existing_cmd or "")
    or str(wrapper_path) in (existing_cmd or "")
)

if not existing_cmd:
    settings["statusLine"] = {"type": "command", "command": bridge_cmd}
elif existing_cmd == bridge_cmd or already_wrapped:
    pass  # already set (possibly via our own wrapper on a prior run)
else:
    # Conflict: existing statusLine must be wrapped.
    # Write a wrapper script and point statusLine at it.
    wrapper = f"""#!/usr/bin/env bash
# Auto-generated by agenticToolset installer — wraps two statusLine scripts.
RAW=$(cat)
echo "$RAW" | "{sys.executable}" "{hooks_dir}/ts-statusline_bridge.py" > /dev/null 2>&1 || true
echo "$RAW" | {existing_cmd}
"""
    wrapper_path.write_text(wrapper, encoding="utf-8")
    wrapper_path.chmod(0o755)
    settings["statusLine"] = {
        "type": "command",
        "command": f'bash "{wrapper_path}"',
    }
    print(f"   ⚠  Existing statusLine detected — wrapper written to {wrapper_path}")

settings_path.write_text(
    json.dumps(settings, indent=2, ensure_ascii=False),
    encoding="utf-8"
)
print("   ✓ settings.json patched")
PYEOF

# ── scaffold ──────────────────────────────────────────────────────────────────

if [[ -d scaffold ]]; then
  if [[ "${SCAFFOLD:-}" == "y" ]]; then
    echo "→ Scaffolding project root (SCAFFOLD=y): ${PROJECT_DIR}"
    for item in scaffold/*; do
      name="$(basename "${item}")"
      dest="${PROJECT_DIR}/${name}"
      if [[ -e "${dest}" ]]; then
        if [[ "${SCAFFOLD_OVERWRITE:-}" == "y" ]]; then
          echo "   ✓ ${name} (overwritten)"
        else
          echo "   skip ${name} (already exists — set SCAFFOLD_OVERWRITE=y to replace)"
          continue
        fi
      fi
      cp -r "${item}" "${dest}"
      echo "   ✓ ${name}"
    done
  else
    echo "→ Scaffold templates available but skipped (non-interactive install)."
    echo "   Re-run with SCAFFOLD=y to copy them into ${PROJECT_DIR}:"
    echo "     curl -fsSL ${RELEASE_URL%/release.zip}/install.sh | SCAFFOLD=y bash"
  fi
fi

# ── cleanup ───────────────────────────────────────────────────────────────────

rm -rf "${TMPDIR_INSTALL}"

echo ""
echo "✓ Done. Reload Claude Code to activate hooks."
echo ""
echo "  Next: install third-party skills:"
echo "    npx skills add caveman-commit@latest"
echo "    npx skills add spectra@latest"
