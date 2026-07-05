#!/usr/bin/env bash
set -euo pipefail

PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
DELIVER_STATE="$PROJ/.agents/ts-deliver-router/state.json"
ITERATION="$PROJ/.agents/iteration.json"
DISCOVERY="$PROJ/.agents/discovery.json"

# ══ Guards — each prints its block reason and stops the hook ═══════════════

check_schema_version() {
  local ver
  ver=$(jq -r '.schema_version // empty' "$DELIVER_STATE" 2>/dev/null) || true
  if [ -n "$ver" ] && [ "$ver" != "1" ]; then
    echo "[BLOCKED] state schema version mismatch"
    exit 0
  fi
}

check_dry_run() { # $1 = phase
  local dry
  dry=$(jq -r '.dry_run // false' "$DELIVER_STATE" 2>/dev/null) || true
  if [ "$dry" = "true" ] && [ "$1" = "ship" ]; then
    echo "[DRY-RUN] cannot sign security gate in dry-run mode"
    exit 0
  fi
}

check_g2_gate() { # $1 = phase
  local status
  status=$(jq -r '.gates["G2"].status // empty' "$DELIVER_STATE" 2>/dev/null) || true
  if [ "$status" = "pending" ] && [ "$1" = "ship" ]; then
    echo "[BLOCKED] Ship blocked: G2 (sec-review) gate not signed"
    exit 0
  fi
}

# ══ [NEXT] tables — executable copy of ts-orchestrate/SKILL.md →
#    "Workflow Guidance (Dual-Track)". One case arm per table row (D9:
#    manual lockstep — edit BOTH when guidance changes). ═══════════════════

next_for_delivery() { # $1 = phase, $2 = epic type; dispatch key "$1:$2"
  case "$1:$2" in
    think:*)       echo "[NEXT] Run /ts-deliver:refine after Spectra:discuss + G1 threat-model sign-off" ;; # SKILL.md: Delivery|think
    plan:*)        echo "[NEXT] Run /ts-deliver:refine after Spectra:propose + design review" ;;            # SKILL.md: Delivery|plan
    build:*)       echo "[NEXT] Run /ts-deliver:refine after Spectra:apply + test coverage gate" ;;         # SKILL.md: Delivery|build
    review:*)      echo "[NEXT] Run /ts-deliver:refine after staff-review report" ;;                        # SKILL.md: Delivery|review
    test:*)        echo "[NEXT] Run /ts-deliver:refine after acceptance + integration gates" ;;             # SKILL.md: Delivery|test
    ship:*)        echo "[NEXT] Run /ts-deliver:refine after Spectra:archive + G2 sec-review sign-off" ;;   # SKILL.md: Delivery|ship
    reflect:spike) echo "[NEXT] Write learning entry to discovery.json first, then run /ts-iteration:next (or /ts-iteration:close if last epic)" ;; # SKILL.md: Delivery|reflect (spike clause)
    reflect:*)     echo "[NEXT] Run /ts-iteration:next (or /ts-iteration:close if last epic)" ;;            # SKILL.md: Delivery|reflect
    *)             echo "[NEXT] Unknown phase: $1 — check state.json" ;;
  esac
}

# Discovery rows with no arm here, by design: "keep-learning" is a decision
# outcome (status returns to exploring), "killed"/"reduce-scope" are terminal
# and excluded from the focus-priority chain in focus_idea().
next_for_discovery() { # $1 = focus status, $2 = focus idea id
  case "$1" in
    idea)       echo "[NEXT] Run /ts-discover explore $2 (WIP limit 3)" ;;                                            # SKILL.md: Discovery|idea
    exploring)  echo "[NEXT] Run /ts-discover validate $2 (required if H-risk) or /ts-discover decide $2 build" ;;    # SKILL.md: Discovery|exploring
    validating) echo "[NEXT] Run /ts-discover decide $2 — ts-ddd-tactical-validator must not FAIL" ;;                 # SKILL.md: Discovery|validating
    ready)      echo "[NEXT] Run /ts-project plan --sync" ;;                                                          # SKILL.md: Discovery|ready
    *)          echo "[NEXT] Run /ts-discover idea \"<desc>\" or /ts-project:plan --new" ;;                           # no focus idea → seed
  esac
}

# ══ Discovery helper ═══════════════════════════════════════════════════════

focus_idea() { # prints "status<TAB>id" of the focus idea, or nothing
  # Priority: validating > exploring > idea > ready (first match, one line).
  jq -r '
    (.ideas // []) as $i |
    ( first($i[] | select(.status == "validating"))
      // first($i[] | select(.status == "exploring"))
      // first($i[] | select(.status == "idea"))
      // first($i[] | select(.status == "ready"))
      // empty ) | "\(.status)\t\(.id)"' "$DISCOVERY" 2>/dev/null || true
}

# ══ Track runners ══════════════════════════════════════════════════════════

run_delivery_track() {
  local phase epic epic_type
  phase=$(jq -r '.current_phase // "unknown"' "$DELIVER_STATE" 2>/dev/null) || exit 0

  check_schema_version
  check_dry_run "$phase"
  check_g2_gate "$phase"

  epic=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || epic="none"
  epic_type=$(jq -r --arg id "$epic" '(.epics // []) | first(.[] | select(.id == $id)) | .type // empty' "$ITERATION" 2>/dev/null) || epic_type=""

  echo "[WORKFLOW STATE] ts-deliver phase: $phase | active epic: $epic"
  next_for_delivery "$phase" "$epic_type"
}

run_discovery_track() {
  local dial epic focus status id
  dial=$(jq -r '.dial // "MID"' "$ITERATION" 2>/dev/null) || exit 0
  epic=$(jq -r 'if .active_epic then .active_epic else "none" end' "$ITERATION" 2>/dev/null) || epic="none"

  echo "[WORKFLOW STATE] Discovery | dial: $dial | active_epic: $epic"

  focus=""
  if [ -f "$DISCOVERY" ]; then
    focus=$(focus_idea)
  fi
  status="${focus%%$'\t'*}"
  id="${focus#*$'\t'}"
  next_for_discovery "$status" "$id"
}

# ══ Dispatch — Delivery state wins; Discovery only when no deliver state ═══

if [ -f "$DELIVER_STATE" ]; then
  run_delivery_track
elif [ -f "$ITERATION" ]; then
  run_discovery_track
fi
