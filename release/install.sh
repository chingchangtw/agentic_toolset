#!/usr/bin/env bash
# install.sh — agenticToolset installer (macOS / Linux / Git Bash / WSL)
# Usage:
#   curl -fsSL https://github.com/OWNER/REPO/releases/latest/download/install.sh | bash
#   GITHUB_TOKEN=ghp_xxx bash install.sh   # for private repos

set -euo pipefail

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

# ── download ──────────────────────────────────────────────────────────────────

echo "→ Downloading release..."
CURL_ARGS=(-fsSL --output "${TMPDIR_INSTALL}/release.zip")
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  CURL_ARGS+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
fi
curl "${CURL_ARGS[@]}" "${RELEASE_URL}"

cd "${TMPDIR_INSTALL}"
unzip -q release.zip

# ── skills & hooks (manifest-driven, or legacy fallback for old zips) ─────────

if [[ -f manifest.json ]]; then

  # ── skills (manifest-driven) ─────────────────────────────────────────────────

  echo "→ Installing skills → ${SKILLS_DIR}/"
  mkdir -p "${SKILLS_DIR}"
  while IFS=$'\t' read -r dest_path install_subpath; do
    mkdir -p "${SKILLS_DIR}/$(dirname "${install_subpath}")"
    cp -r "${dest_path}" "${SKILLS_DIR}/${install_subpath}"
    echo "   ✓ skill: ${install_subpath}"
  done < <(python3 -c "
import json, sys
m = json.load(open('manifest.json'))
for e in m['skills']:
    install_subpath = e['dest'][len('skills/'):]
    print(e['dest'] + '\t' + install_subpath)
")

  # ── hooks (manifest-driven, routed by scope) ──────────────────────────────────

  echo "→ Installing hooks..."
  mkdir -p "${HOOKS_DIR}"
  mkdir -p "${PROJECT_HOOKS_DIR}"
  while IFS=$'\t' read -r dest_path scope name; do
    if [[ "${scope}" == "project" ]]; then
      target_dir="${PROJECT_HOOKS_DIR}"
    else
      target_dir="${HOOKS_DIR}"
    fi
    cp "${dest_path}" "${target_dir}/${name}"
    chmod +x "${target_dir}/${name}"
    echo "   ✓ hook (${scope}): ${name}"
  done < <(python3 -c "
import json, sys
m = json.load(open('manifest.json'))
for e in m['hooks']:
    print(e['dest'] + '\t' + e['scope'] + '\t' + e['name'])
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

# ── project settings.json (UserPromptSubmit hook registration) ─────────────────

echo "→ Patching ${PROJECT_SETTINGS}"
mkdir -p "${PROJECT_CLAUDE_DIR}"

python3 - "${PROJECT_SETTINGS}" << 'PYEOF2'
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

python3 - "${SETTINGS}" "${HOOKS_DIR}" << 'PYEOF'
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
hook_cmd = f"python3 {hooks_dir}/ts-session-guard.py"
hooks = settings.setdefault("hooks", {})
ups   = hooks.setdefault("UserPromptSubmit", [])

# Check if already registered (idempotent)
already = any(
    hook.get("command") == hook_cmd
    for entry in ups
    for hook in entry.get("hooks", [])
)
if not already:
    ups.append({"hooks": [{"type": "command", "command": hook_cmd}]})

# ── statusLine ───────────────────────────────────────────────────────────────
bridge_cmd  = f"python3 {hooks_dir}/ts-statusline_bridge.py"
existing_sl = settings.get("statusLine")

if not existing_sl:
    settings["statusLine"] = bridge_cmd
elif existing_sl == bridge_cmd:
    pass  # already set
else:
    # Conflict: existing statusLine must be wrapped.
    # Write a wrapper script and point statusLine at it.
    wrapper_path = Path(hooks_dir) / "statusline_wrapper.sh"
    wrapper = f"""#!/usr/bin/env bash
# Auto-generated by agenticToolset installer — wraps two statusLine scripts.
RAW=$(cat)
echo "$RAW" | python3 "{hooks_dir}/ts-statusline_bridge.py" > /dev/null 2>&1 || true
echo "$RAW" | {existing_sl}
"""
    wrapper_path.write_text(wrapper, encoding="utf-8")
    wrapper_path.chmod(0o755)
    settings["statusLine"] = str(wrapper_path)
    print(f"   ⚠  Existing statusLine detected — wrapper written to {wrapper_path}")

settings_path.write_text(
    json.dumps(settings, indent=2, ensure_ascii=False),
    encoding="utf-8"
)
print("   ✓ settings.json patched")
PYEOF

# ── scaffold ──────────────────────────────────────────────────────────────────

if [[ -d scaffold ]]; then
  echo "→ Scaffold project root? Copy templates to current directory: $(pwd)"
  read -r -p "   Scaffold here? [y/N] " SCAFFOLD_ANSWER
  if [[ "${SCAFFOLD_ANSWER,,}" == "y" ]]; then
    for item in scaffold/*; do
      name="$(basename "${item}")"
      if [[ -e "${name}" ]]; then
        read -r -p "   ${name} already exists — overwrite? [y/N] " OW
        [[ "${OW,,}" != "y" ]] && echo "   skip ${name}" && continue
      fi
      cp -r "${item}" "./${name}"
      echo "   ✓ ${name}"
    done
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
