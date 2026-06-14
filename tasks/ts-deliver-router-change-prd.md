# ts-deliver-router — Change Plan
**Format:** gstack THINK → Spectra PLAN / BUILD / REVIEW → Spectra TEST → SHIP → REFLECT
**Type:** Change / Improvement (applies to existing `lifecycle-router` skill — plain
text and reference files held in GitHub)
**Skill:** `lifecycle-router` → `ts-deliver-router`
**Date:** 2026-06-14
**Status:** Ready for Build
**Rename reference:** `RENAME-MAP.md`

---

## THINK *(gstack — problem reframe)*

### What does this change do?

Two bundled changes, each small and additive:

**1. Family-wide rename to `ts-` prefix**
`lifecycle-router` → `ts-deliver-router`. All commands, the private workspace
directory, and all four sub-agents follow the same prefix (full mapping in
`RENAME-MAP.md`). This brings the skill into namespace alignment with the new
`ts-project-planner` and `ts-acpl`.

**2. Discovery feedback hook**
`ts-project-planner` now has a Discovery track (Idea → Explore → Validate →
Ready). Per dual-track agile, Delivery feeds Discovery back when it surfaces an
unknown. This change adds exactly one new behavior: when Think or Build
encounters an unresolved assumption meeting specific criteria, call
`/ts-discover idea --from-router`.

### Why bundle these two changes together?

Both touch the same files (`SKILL.md`, `SKILL_caveman.md`, all `references/*.md`,
`PROJECT_SETUP.md`). Doing the rename and the hook addition in separate passes
would mean two find-and-replace migrations against the same GitHub files.
Bundling means one migration, one verification pass.

### What this change does NOT do

- Does not change the 7-phase spine (Think→Plan→Build→Review→Test→Ship→Reflect)
- Does not change DIAL, CHECKS REGISTRY, or PROJECT REGISTRY *structure* — only
  paths and tool IDs referenced within them are renamed
- Does not change any gate (G1/G2) logic
- Does not change phase exit contracts beyond the one new hook call
- Does not change `.ai/` workspace root or any shared artifact filename
  (`domain.json`, `iteration.json`, `risks.md`, `decisions/` — all unchanged
  per `RENAME-MAP.md`)

### Forcing questions

**Q: Why rename now, mid-series, rather than when the skill was first built?**
The `ts-` prefix only became necessary once a *family* of skills existed —
`ts-project-planner` and `ts-acpl` are new. A single skill doesn't need a
namespace prefix; a family does. Renaming now (before the family grows further)
is cheaper than renaming after a third or fourth skill depends on these paths.

**Q: Why does the feedback hook live in `ts-deliver-router` rather than being
purely `ts-project-planner`'s responsibility to poll for?**
Polling would require `ts-project-planner` to inspect `ts-deliver-router`'s
internal phase state continuously, which violates the existing read-only
boundary (`ts-project-planner` only reads `state.json` status fields at
write-back time). A push-based hook — `ts-deliver-router` calls
`/ts-discover idea --from-router` at the moment the unknown is surfaced — keeps
the boundary intact and the signal timely.

**Q: Could this hook fire too often and flood Discovery?**
Addressed by three gating criteria (see PLAN below): the unknown must block a
gate, affect more than one epic's scope, or introduce a new external dependency.
Implementation-detail unknowns are logged in `state.json` notes, not surfaced.

### Design document output

```
Rename:          lifecycle-router → ts-deliver-router (full mapping: RENAME-MAP.md)
New behavior:    one hook — /ts-discover idea --from-router
Hook location:   Think phase (domain-level unknowns) + Build phase (implementation
                 unknowns that meet gating criteria)
Hook gating:     fires only if unknown (a) blocks G1/G2, OR (b) affects >1 epic
                 scope, OR (c) introduces new external dependency
Files touched:   SKILL.md, SKILL_caveman.md, all references/*.md, PROJECT_SETUP.md,
                 README.md — rename only, plus hook addition to router algorithm
                 step 3 (Think) and step 4 (Build always-checks)
Breaking:        .ai/lifecycle-router/ → .ai/ts-deliver-router/ (one-time migration)
                 registry.json tool ids for sub-agents must be updated per RENAME-MAP.md
```

---

## PLAN *(Spectra — scenarios as spec)*

### Feature: Family-Wide Rename

```gherkin
Feature: All skill identifiers follow ts- prefix per RENAME-MAP.md

  Scenario: Skill frontmatter renamed
    Given the prior SKILL.md frontmatter has name: lifecycle-router
    When the rename is applied
    Then SKILL.md frontmatter has name: ts-deliver-router
    And SKILL_caveman.md frontmatter matches

  Scenario: All commands renamed
    Given the prior SKILL.md documents /router init, /router refine,
      /router status, /router dry-run
    When the rename is applied
    Then SKILL.md documents /ts-router init, /ts-router refine,
      /ts-router status, /ts-router dry-run
    And no occurrence of the bare string "/router " remains in any skill file

  Scenario: Sub-agent references renamed
    Given references/sub-agents.md documents event-storming-facilitator,
      spec-validator, ddd-tactical-validator, mutation-analyst
    When the rename is applied
    Then all four are renamed per RENAME-MAP.md:
      ts-event-storming-facilitator, ts-spec-validator,
      ts-ddd-tactical-validator, ts-mutation-analyst
    And references/sub-agents.md file paths update to
      .claude/agents/ts-<name>.md

  Scenario: Private workspace directory renamed
    Given the prior skill reads/writes .ai/lifecycle-router/state.json,
      .ai/lifecycle-router/registry.json, .ai/lifecycle-router/autonomy,
      .ai/lifecycle-router/registry.log
    When the rename is applied
    Then all four paths become .ai/ts-deliver-router/<file>
    And .ai/ workspace root, WORKSPACE.md, domain.json, iteration.json,
      risks.md, decisions/ remain UNCHANGED (per RENAME-MAP.md)

  Scenario: registry.json tool ids updated
    Given an existing .ai/lifecycle-router/registry.json has
      collection[].id values: "acpl", "event-storming-facilitator",
      "mutation-analyst"
    When /ts-router init or /ts-router refine next runs
    Then those ids are updated to "ts-acpl", "ts-event-storming-facilitator",
      "ts-mutation-analyst" respectively
    And tier and gate fields for each entry are preserved unchanged

  Scenario: Cross-references to ts-project-planner updated
    Given references/acpl-integration.md and SKILL.md reference
      "project-planner" for iteration.json write-back
    When the rename is applied
    Then all such references read "ts-project-planner"
    And the iteration.json write-back field list (status, branch,
      mutation_score, shipped_at, active_epic) is unchanged
```

### Feature: Discovery Feedback Hook

```gherkin
Feature: Think phase surfaces domain-level unknowns to Discovery

  Scenario: Think phase identifies an unvalidated H-risk assumption
    Given current phase is Think for active epic EPIC-GL-CORE
    And ts-event-storming-facilitator's exploration surfaces an assumption:
      "Multi-currency required from day 1" with no prior validation record
    When Think phase evaluates hook gating criteria
    Then the assumption affects scope of EPIC-GL-CORE and potentially
      EPIC-PROCUREMENT-CORE (>1 epic) — criterion (b) met
    And /ts-discover idea --from-router is called with:
      | param        | value                                    |
      | description  | "Multi-currency required from day 1"    |
      | source_epic  | EPIC-GL-CORE                             |
    And Think phase continues without blocking on the hook's response

Feature: Build phase surfaces implementation-level unknowns to Discovery

  Scenario: Build phase discovers a new external dependency
    Given current phase is Build for active epic EPIC-GL-CORE
    And implementation requires a third-party tax calculation API not
      previously in scope
    When Build phase's always-on checks evaluate hook gating criteria
    Then criterion (c) "introduces new external dependency" is met
    And /ts-discover idea --from-router is called with:
      | param        | value                                       |
      | description  | "Tax API integration reliability"          |
      | source_epic  | EPIC-GL-CORE                                |

  Scenario: Build phase encounters a minor detail — hook does NOT fire
    Given current phase is Build for active epic EPIC-GL-CORE
    And implementation reveals a minor naming inconsistency in an existing
      internal module (no gate impact, single-epic, no new dependency)
    When Build phase's always-on checks evaluate hook gating criteria
    Then none of (a) gate-blocking, (b) multi-epic, (c) new dependency are met
    And /ts-discover idea --from-router is NOT called
    And the detail is recorded in state.json.notes instead

  Scenario: G1 gate cannot pass while a from-router idea is unresolved for this epic
    Given idea-007 (source_epic=EPIC-GL-CORE) has status=idea, created via
      --from-router during Build
    And current phase is Review, evaluating G1 for EPIC-GL-CORE
    When G1 checklist runs the "privacy inventory reviewed" item
    Then router surfaces "idea-007 (Tax API reliability) is unresolved in
      Discovery and is linked to this epic — resolve via /ts-discover before
      G1 sign-off, or explicitly accept the risk in state.gates.G1.notes"
    And human may either resolve the discovery item or explicitly accept and
      proceed — G1 is not hard-blocked by Discovery state, but the linkage is
      surfaced
```

---

## BUILD *(Spectra — implementation contracts)*

```gherkin
Feature: Rename is exhaustive and verifiable

  Scenario: Zero old-name occurrences remain
    Given the updated SKILL.md, SKILL_caveman.md, all references/*.md,
      PROJECT_SETUP.md, README.md
    When grep searches for "lifecycle-router"
    Then zero matches are found
      (unlike the original ts-lifecycle-router target, "ts-deliver-router"
       shares no substring with "lifecycle-router" — a plain zero-match
       check is sufficient, no "excluding ts-..." filter needed)
    When grep searches for ".ai/lifecycle-router/"
    Then zero matches are found
    When grep searches for "/router " (with trailing space, old command form)
    Then zero matches are found
    When grep searches for any of the four old sub-agent names without "ts-" prefix
    Then zero matches are found

  Scenario: SKILL.md and SKILL_caveman.md remain content-consistent after rename + hook
    Given SKILL.md is updated with the rename and the new hook section
    When SKILL_caveman.md is compared to SKILL.md
    Then the hook's gating criteria (a)/(b)/(c) appear in both
    And the hook command /ts-discover idea --from-router appears in both
    And SKILL_caveman.md word count remains ≤ 50% of SKILL.md word count

Feature: Router algorithm gains one hook step

  Scenario: Step 3 (Think) includes hook evaluation
    Given the router algorithm's step 3 in the prior version reads
      "verify artifacts for state.current_phase pass min-schema"
    When the hook is added
    Then step 3 additionally evaluates: "for each new assumption surfaced this
      phase, check hook gating criteria (a)/(b)/(c); if met, call
      /ts-discover idea --from-router; continue regardless of result"
    And this addition does not change the STOP conditions of step 3
      (min-schema failure still halts as before)

  Scenario: Step 4 (Build always-checks) includes hook evaluation
    Given the router algorithm's step 4 runs CHECKS REGISTRY always-checks
    When the hook is added
    Then step 4 additionally runs the same gating evaluation for unknowns
      surfaced during Build's always-on checks (Semgrep/Trivy/code-review-graph
      findings that imply a new external dependency, etc.)
```

---

## REVIEW *(Spectra — risk scenarios)*

```gherkin
Feature: Migration risk coverage

  Scenario: Existing .ai/lifecycle-router/ directory migrated without data loss
    Given a project has .ai/lifecycle-router/state.json, registry.json,
      autonomy, registry.log from the prior version
    When the developer runs the SHIP migration steps
    Then .ai/ts-deliver-router/ contains all four files with content unchanged
    And /ts-router status reflects the same phase and DIAL setting as before
      migration

  Scenario: registry.json with old tool ids does not break /ts-router status
    Given .ai/ts-deliver-router/registry.json (post-directory-rename) still
      has collection[].id = "event-storming-facilitator" (old id, not yet
      updated)
    When user runs /ts-router status
    Then router still functions (does not crash on unrecognized-but-present id)
    And surfaces a note: "registry.json contains pre-rename tool ids — run
      /ts-router refine to update"

Feature: Hook gating risk coverage

  Scenario: Hook failure does not block phase progression
    Given /ts-discover idea --from-router fails (e.g. ts-project-planner not
      installed)
    When Think or Build phase attempts the hook call
    Then the failure is logged in state.json.notes as
      "discovery hook unavailable — ts-project-planner not detected"
    And phase progression continues normally
    And this is NOT treated as a gate failure

  Scenario: Hook does not create duplicate ideas across repeated Build runs
    Given idea-007 (source_epic=EPIC-GL-CORE, "Tax API integration reliability")
      already exists from a prior Build run
    And the same unknown is encountered again in a later Build session for the
      same epic
    When the hook gating criteria are evaluated again
    Then /ts-discover idea --from-router is called again
    And ts-project-planner's dedup check (per its own PRD) prevents a duplicate
      entry — this skill does not need its own dedup logic
```

---

## TEST *(Spectra apply — archive scenarios)*

All scenarios from PLAN, BUILD, and REVIEW constitute the test suite. Archive at
Test phase entry — no post-archive edits.

**Mutation targets:**

| Component | Target | Tool |
|---|---|---|
| Rename completeness (grep-based) | 100% | CI grep assertions — zero tolerance |
| Hook gating criteria (a)/(b)/(c) evaluation | 100% | One test per criterion + one "none met" test |
| Hook failure handling (non-blocking) | 100% | Mock ts-discover unavailable, assert phase continues |
| registry.json legacy-id tolerance | ≥ 80% | Stryker |

---

## SHIP

```bash
# 1. In the GitHub repo holding the plain-text skill files:

# 1a. Rename the skill directory
git mv lifecycle-router ts-deliver-router

# 1b. Apply renames across all skill files (frontmatter, commands, paths,
#     sub-agent names) per RENAME-MAP.md — recommended via scripted find/replace:
find ts-deliver-router -type f -name "*.md" -exec sed -i \
  -e 's/lifecycle-router/ts-deliver-router/g' \
  -e 's|/router |/ts-router |g' \
  -e 's/event-storming-facilitator/ts-event-storming-facilitator/g' \
  -e 's/spec-validator/ts-spec-validator/g' \
  -e 's/ddd-tactical-validator/ts-ddd-tactical-validator/g' \
  -e 's/mutation-analyst/ts-mutation-analyst/g' \
  -e 's/\bacpl\b/ts-acpl/g' \
  -e 's/project-planner/ts-project-planner/g' \
  {} +
# Single-pass substitution is sufficient: "lifecycle-router" → "ts-deliver-router"
# shares no substring relationship in either direction, so no collapse/cleanup
# rule is needed (unlike the previously-considered "ts-lifecycle-router" target,
# which was a superstring of its own source).

# 2. Add the new hook section to SKILL.md and SKILL_caveman.md (manual edit —
#    see PLAN "Discovery Feedback Hook" scenarios for exact placement in the
#    router algorithm steps 3 and 4)

# 3. Migrate per-project state directories
mkdir -p .ai/ts-deliver-router/
mv .ai/lifecycle-router/* .ai/ts-deliver-router/
rmdir .ai/lifecycle-router/

# 4. Update registry.json tool ids
/ts-router refine   # surfaces legacy ids, offers update per RENAME-MAP.md

# 5. Verify
/ts-router status
grep -r "lifecycle-router" ts-deliver-router/
# expect: zero output (no "grep -v" filter needed — see note above)
```

**Release checklist:**
```
[x] git mv applied — directory renamed in repo
[x] All renames per RENAME-MAP.md applied across SKILL.md, SKILL_caveman.md,
    references/*.md, PROJECT_SETUP.md, README.md
[x] grep verification: zero old-name occurrences (4 patterns checked)
[x] Hook section added to router algorithm steps 3 and 4 in both SKILL.md and
    SKILL_caveman.md
[x] SKILL.md ↔ SKILL_caveman.md content-consistent post-edit
[x] Migration steps tested against a project with existing .ai/lifecycle-router/
[x] registry.json legacy-id tolerance verified (does not crash /ts-router status)
```

---

## REFLECT

### What changed and why

| Change | Reason |
|---|---|
| `lifecycle-router` → `ts-deliver-router` (full family rename) | Namespace consistency now that `ts-project-planner` and `ts-acpl` exist as siblings |
| `.ai/lifecycle-router/` → `.ai/ts-deliver-router/` | Follows skill rename; `.ai/` root and shared artifacts unchanged |
| Sub-agents renamed `ts-*` | Consistency; referenced by both this skill and `ts-project-planner` |
| New hook: `/ts-discover idea --from-router` in Think (step 3) and Build (step 4) | Closes the dual-track loop — Delivery's unknowns become Discovery's inputs |
| Hook gated by 3 criteria, non-blocking on failure | Prevents flooding Discovery with noise; prevents a missing dependency from halting Delivery |
| G1 surfaces (but does not hard-block on) linked Discovery items | Keeps the two tracks coupled for visibility without making Delivery hostage to Discovery's pace |

### Design principles maintained

- Add rigour, never add scope — one hook, gated by three explicit criteria, non-blocking
- State is written, never inferred — hook calls are logged in `state.json.notes` regardless of outcome
- Core 4 invariant (gstack/Spectra/code-review-graph/caveman) untouched
- Security gates always pause for human — G1 linkage to Discovery is advisory, not a new blocking condition

### Known limitations carried forward

- The `sed`-based rename script is a **one-time pass over the original,
  un-prefixed `lifecycle-router` files** — it is not idempotent. Re-running it
  against already-renamed output would double-prefix via word-boundary rules
  (e.g. `\bacpl\b` matches the "acpl" inside "ts-acpl" too, since `-` is a
  word-boundary character, producing "ts-ts-acpl"). Run once against the
  pristine source, then rely on the grep verification step — do not re-run.
- Hook gating criteria (a)/(b)/(c) are evaluated by the agent's judgment, not a
  deterministic rule engine — quality depends on the model correctly
  classifying "new external dependency" vs. "existing dependency used
  differently." May need refinement after first real use.
- G1's surfacing of linked Discovery items depends on `ts-project-planner`
  having processed the `--from-router` call before Review begins; if Discovery
  hasn't yet run `/ts-discover explore` on the new idea, G1 surfaces it in its
  raw `status=idea` form with no `exploration_output` — still useful as a flag,
  but less informative.
