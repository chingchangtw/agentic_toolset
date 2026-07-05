#!/usr/bin/env bash
set -euo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DELIVER_STATE="$PROJ/.agents/ts-deliver-router/state.json"
ITERATION="$PROJ/.agents/iteration.json"

if [ -f "$DELIVER_STATE" ]; then
  PHASE=$(jq -r '.current_phase // "unknown"' "$DELIVER_STATE" 2>/dev/null) || exit 0

  SCHEMA_VER=$(jq -r '.schema_version // empty' "$DELIVER_STATE" 2>/dev/null) || true
  if [ -n "$SCHEMA_VER" ] && [ "$SCHEMA_VER" != "1" ]; then
    echo "[BLOCKED] state schema version mismatch"
    exit 0
  fi

  DRY_RUN=$(jq -r '.dry_run // false' "$DELIVER_STATE" 2>/dev/null) || true
  if [ "$DRY_RUN" = "true" ] && [ "$PHASE" = "ship" ]; then
    echo "[DRY-RUN] cannot sign security gate in dry-run mode"
    exit 0
  fi

  GATE_STATUS=$(jq -r '.gates["sec-review"].status // empty' "$DELIVER_STATE" 2>/dev/null) || true
  if [ "$GATE_STATUS" = "pending" ] && [ "$PHASE" = "ship" ]; then
    echo "[BLOCKED] Ship blocked: sec-review gate not signed"
    exit 0
  fi

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

  DISCOVERY="$PROJ/.agents/discovery.json"
  FOCUS=""
  if [ -f "$DISCOVERY" ]; then
    # Focus idea priority: validating > exploring > idea > ready (first match).
    FOCUS=$(jq -r '
      (.ideas // []) as $i |
      ( first($i[] | select(.status == "validating"))
        // first($i[] | select(.status == "exploring"))
        // first($i[] | select(.status == "idea"))
        // first($i[] | select(.status == "ready"))
        // empty ) | "\(.status)\t\(.id)"' "$DISCOVERY" 2>/dev/null) || FOCUS=""
  fi
  STATUS="${FOCUS%%$'\t'*}"
  ID="${FOCUS#*$'\t'}"
  case "$STATUS" in
    idea)       echo "[NEXT] Run /ts-discover explore $ID (WIP limit 3)" ;;
    exploring)  echo "[NEXT] Run /ts-discover validate $ID (required if H-risk) or /ts-discover decide $ID build" ;;
    validating) echo "[NEXT] Run /ts-discover decide $ID — ts-ddd-tactical-validator must not FAIL" ;;
    ready)      echo "[NEXT] Run /ts-project plan --sync" ;;
    *)          echo "[NEXT] Run /ts-discover idea \"<desc>\" or /ts-project:plan --new" ;;
  esac
fi
