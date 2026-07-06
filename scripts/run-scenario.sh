#!/usr/bin/env bash
set -euo pipefail

SCENARIO_ID="${1:-}"
if [ -z "$SCENARIO_ID" ]; then
  echo "Usage: $0 <scenario-id>  (e.g., S1)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

FIXTURE_MAP="S1:bugfix-high S2:bugfix-mid S3:bugfix-low S4:refactor-high S5:refactor-mid S6:refactor-low S7:epic-high S8:epic-mid S9:epic-low S10:resume-incoherent S11:feedback-loop S12:gate-bypass"

FIXTURE_NAME=""
for entry in $FIXTURE_MAP; do
  id="${entry%%:*}"
  name="${entry##*:}"
  if [ "$id" = "$SCENARIO_ID" ]; then
    FIXTURE_NAME="$name"
    break
  fi
done

if [ -z "$FIXTURE_NAME" ]; then
  echo "Unknown scenario ID: $SCENARIO_ID" >&2
  echo "Known IDs: S1 S2 S3 S4 S5 S6 S7 S8 S9 S10 S11 S12" >&2
  exit 1
fi

FIXTURE_FILE="$PROJECT_ROOT/tests/orchestration/fixtures/iteration-state/${FIXTURE_NAME}.json"
SCENARIO_FILE="$PROJECT_ROOT/tests/orchestration/scenarios/${SCENARIO_ID}-${FIXTURE_NAME}.md"

if [ ! -f "$FIXTURE_FILE" ]; then
  echo "Fixture not found: $FIXTURE_FILE" >&2
  exit 1
fi

if [ ! -f "$SCENARIO_FILE" ]; then
  echo "Scenario file not found: $SCENARIO_FILE" >&2
  exit 1
fi

TEST_WORKSPACE=$(mktemp -d /tmp/scenario-test-XXXXXX)
trap 'rm -rf "$TEST_WORKSPACE"' EXIT

mkdir -p "$TEST_WORKSPACE/.agents/ts-deliver-router"
cp "$FIXTURE_FILE" "$TEST_WORKSPACE/.agents/iteration.json"

EPIC_TYPE=$(jq -r '.epics[0].type // "epic"' "$FIXTURE_FILE")
DIAL=$(jq -r '.dial // "MID"' "$FIXTURE_FILE")

PHASE_MAP_bugfix="think"
PHASE_MAP_refactor="think"
PHASE_MAP_epic="think"

case "$EPIC_TYPE" in
  bugfix)   INITIAL_PHASE="think" ;;
  refactor) INITIAL_PHASE="think" ;;
  epic)     INITIAL_PHASE="think" ;;
  *)        INITIAL_PHASE="think" ;;
esac

cat > "$TEST_WORKSPACE/.agents/ts-deliver-router/state.json" <<EOF
{"current_phase": "$INITIAL_PHASE", "schema_version": "1"}
EOF

HOOK_OUTPUT=$(CLAUDE_PROJECT_DIR="$TEST_WORKSPACE" bash "$PROJECT_ROOT/src/hook/inject-workflow-state.sh" 2>/dev/null || true)

ASSERTIONS=$(grep "^    assert" "$SCENARIO_FILE" | sed 's/^    //' || true)

echo "TAP version 14"

TEST_NUM=0
FAIL_COUNT=0

while IFS= read -r assertion; do
  [ -z "$assertion" ] && continue
  TEST_NUM=$((TEST_NUM + 1))

  TYPE="${assertion%%:*}"
  RAW_VALUE="${assertion#*: }"

  case "$TYPE" in
    assert)
      JQ_EXPR="$RAW_VALUE"
      RESULT=$(jq -r "$JQ_EXPR" "$TEST_WORKSPACE/.agents/iteration.json" 2>/dev/null || echo "false")
      if [ "$RESULT" = "true" ]; then
        echo "ok $TEST_NUM - assert: $JQ_EXPR"
      else
        echo "not ok $TEST_NUM - assert: $JQ_EXPR (got: $RESULT)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
      fi
      ;;
    assert_hook_contains)
      NEEDLE="${RAW_VALUE#\"}"
      NEEDLE="${NEEDLE%\"}"
      if echo "$HOOK_OUTPUT" | grep -qF "$NEEDLE"; then
        echo "ok $TEST_NUM - assert_hook_contains: $NEEDLE"
      else
        echo "not ok $TEST_NUM - assert_hook_contains: $NEEDLE"
        echo "  ---"
        echo "  hook output: $(echo "$HOOK_OUTPUT" | head -5)"
        echo "  ..."
        FAIL_COUNT=$((FAIL_COUNT + 1))
      fi
      ;;
    assert_phase_not_in_history)
      PHASE="${RAW_VALUE#\"}"
      PHASE="${PHASE%\"}"
      HISTORY=$(jq -r '.phase_history // [] | .[]' "$TEST_WORKSPACE/.agents/iteration.json" 2>/dev/null || true)
      if echo "$HISTORY" | grep -qF "$PHASE"; then
        echo "not ok $TEST_NUM - assert_phase_not_in_history: $PHASE (found in history)"
        FAIL_COUNT=$((FAIL_COUNT + 1))
      else
        echo "ok $TEST_NUM - assert_phase_not_in_history: $PHASE"
      fi
      ;;
    *)
      echo "ok $TEST_NUM - unknown assertion type skipped: $TYPE"
      ;;
  esac
done <<< "$ASSERTIONS"

echo "1..$TEST_NUM"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
exit 0
