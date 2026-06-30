#!/usr/bin/env bash
set -euo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DELIVER_STATE="$PROJ/.ai/ts-deliver-router/state.json"
ITERATION="$PROJ/.ai/iteration.json"

if [ -f "$DELIVER_STATE" ]; then
  PHASE=$(jq -r '.current_phase // "unknown"' "$DELIVER_STATE" 2>/dev/null) || exit 0
  EPIC=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || EPIC="none"
  echo "[WORKFLOW STATE] ts-deliver phase: $PHASE | active epic: $EPIC"
  case "$PHASE" in
    think)   echo "[NEXT] Run /ts-deliver:refine after Spectra:discuss + G1 threat-model sign-off" ;;
    plan)    echo "[NEXT] Run /ts-deliver:refine after Spectra:propose + design review" ;;
    build)   echo "[NEXT] Run /ts-deliver:refine after Spectra:apply + test coverage gate" ;;
    review)  echo "[NEXT] Run /ts-deliver:refine after staff-review report" ;;
    test)    echo "[NEXT] Run /ts-deliver:refine after acceptance + integration gates" ;;
    ship)    echo "[NEXT] Run /ts-deliver:refine after Spectra:archive + G2 sec-review sign-off" ;;
    reflect) echo "[NEXT] Run /ts-iteration:next (or /ts-iteration:close if last epic)" ;;
    *)       echo "[NEXT] Unknown phase: $PHASE — check state.json" ;;
  esac
elif [ -f "$ITERATION" ]; then
  DIAL=$(jq -r '.dial // "MID"' "$ITERATION" 2>/dev/null) || exit 0
  EPIC=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || EPIC="none"
  echo "[WORKFLOW STATE] Discovery | dial: $DIAL | active_epic: $EPIC"
fi
