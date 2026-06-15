## 1. Copy Pre-Written Reference Files

- [x] 1.1 Copy `tasks/ts-project-planner/references/workspace-spec.md` to `src/skills/ts-project-planner/references/workspace-spec.md` — file present with full content; verify with `ls src/skills/ts-project-planner/references/workspace-spec.md` and spot-check first heading matches source
- [x] 1.2 Copy `tasks/ts-project-planner/references/discovery-kanban.md` to `src/skills/ts-project-planner/references/discovery-kanban.md` — file present; verify heading and line count match source
- [x] 1.3 Copy `tasks/ts-project-planner/references/iteration-schema.md` to `src/skills/ts-project-planner/references/iteration-schema.md` — file present; verify heading and line count match source
- [x] 1.4 Copy `tasks/ts-project-planner/references/work-unit-profiles.md` to `src/skills/ts-project-planner/references/work-unit-profiles.md`, then check if §Work Unit Types table from SKILL.md lines 174–189 is already covered; if not, append the missing rows — verify all work unit type rows present in destination file

## 2. Extract Inline Sections from SKILL.md

- [x] 2.1 Extract SKILL.md lines 93–172 (§Discovery State Machine: schema, transitions, WIP limit, stale rule, dedup) into new file `src/skills/ts-project-planner/references/discovery-state.md` — content covers flat extraction pattern per design; verify `grep "exploring\|validating\|ready\|killed" src/skills/ts-project-planner/references/discovery-state.md` returns all four states
- [x] 2.2 Extract SKILL.md lines 192–554 (all /ts-discover, /ts-project, /ts-iteration command specs with step-by-step procedures) into new file `src/skills/ts-project-planner/references/commands.md` — covers flat extraction pattern per design; verify `grep "ts-discover explore" src/skills/ts-project-planner/references/commands.md` matches
- [x] 2.3 Extract SKILL.md lines 558–616 (integration contracts, feedback hook contract, G1 enrichment rules) into new file `src/skills/ts-project-planner/references/router-integration.md` — covers flat extraction pattern; verify file exists with integration contract content
- [x] 2.4 Extract SKILL.md lines 619–631 (skills & agents table) into new file `src/skills/ts-project-planner/references/agents.md` — covers flat extraction pattern; verify `ls src/skills/ts-project-planner/references/` shows 8 files total

## 3. Rewrite SKILL.md Core and SKILL_caveman.md

- [x] 3.1 Rewrite `src/skills/ts-project-planner/SKILL.md` to ~100 lines: keep frontmatter, 3-layer intro, workspace paths table, architecture diagram; replace all detail sections with LOAD INDEX table (LOAD INDEX placement per design) — verify `wc -l src/skills/ts-project-planner/SKILL.md` < 120 and `grep "LOAD INDEX" src/skills/ts-project-planner/SKILL.md` matches
- [x] 3.2 Rewrite `src/skills/ts-project-planner/SKILL_caveman.md` as a terse caveman-mode mirror of the new compact core + LOAD INDEX only (no inline detail) — verify file structure mirrors SKILL.md shape and contains no sections that were extracted to references/

## 4. Create raw/ Directory and Populate

- [x] 4.1 Create `src/skills/ts-project-planner/raw/references/` directory (canonical source preservation per design; raw/ directory as canonical source decision) — verify `ls src/skills/ts-project-planner/raw/references/` succeeds
- [x] 4.2 Copy all 8 files from `src/skills/ts-project-planner/references/` to `src/skills/ts-project-planner/raw/references/` verbatim — these become the canonical verbose originals; verify `ls src/skills/ts-project-planner/raw/references/ | wc -l` = 8
- [x] 4.3 Copy the new compact `src/skills/ts-project-planner/SKILL.md` to `src/skills/ts-project-planner/raw/SKILL.md` — captures readable core before any compression; verify `ls src/skills/ts-project-planner/raw/SKILL.md` exists and line count matches SKILL.md

## 5. Caveman-Compress references/ Files

- [x] 5.1 Apply caveman-full compression to `src/skills/ts-project-planner/references/commands.md` in-place (caveman-full compression per design): drop articles/filler/hedging from all prose lines; code blocks and tables: compress only surrounding prose/headers, NOT block content — verify `grep "ts-discover explore" src/skills/ts-project-planner/references/commands.md` still matches and compressed line count < 65% of `raw/references/commands.md`
- [x] 5.2 Apply caveman-full compression to `src/skills/ts-project-planner/references/discovery-kanban.md` in-place — verify `grep -c "." src/skills/ts-project-planner/references/discovery-kanban.md` < 65% of raw equivalent
- [x] 5.3 Apply caveman-full compression to `src/skills/ts-project-planner/references/workspace-spec.md` in-place — verify compressed line count < 65% of raw
- [x] 5.4 Apply caveman-full compression to `src/skills/ts-project-planner/references/discovery-state.md` in-place — verify all four discovery states (exploring, validating, ready, killed) still present after compression: `grep "exploring\|validating\|ready\|killed" src/skills/ts-project-planner/references/discovery-state.md` returns 4 matches
- [x] 5.5 Apply caveman-full compression to `src/skills/ts-project-planner/references/iteration-schema.md` in-place — verify compressed line count < 65% of raw
- [x] 5.6 Apply caveman-full compression to `src/skills/ts-project-planner/references/work-unit-profiles.md` in-place — verify all work unit type names survive compression
- [x] 5.7 Apply caveman-full compression to `src/skills/ts-project-planner/references/router-integration.md` in-place — verify integration contract headers present after compression
- [x] 5.8 Apply caveman-full compression to `src/skills/ts-project-planner/references/agents.md` in-place — verify agents table rows survive; target ~8-10 lines

## 6. Verification

- [x] 6.1 Verify full file structure: `ls src/skills/ts-project-planner/references/` shows 8 files; `ls src/skills/ts-project-planner/raw/references/` shows 8 files; `ls src/skills/ts-project-planner/raw/SKILL.md` exists; `wc -l src/skills/ts-project-planner/SKILL.md` < 120; `grep "LOAD INDEX" src/skills/ts-project-planner/SKILL.md` matches
- [x] 6.2 Spot-check 3 technical facts per file: for each of the 8 reference files, confirm 3 specific technical values (field names, command names, state names, JSON keys) from `raw/references/` are also present in `references/` — flag and re-compress any file where a fact is missing
- [x] 6.3 Verify compression ratios: for each compressed file, confirm its line count < 65% of the corresponding `raw/references/` file; flag any file exceeding this threshold for re-compression
