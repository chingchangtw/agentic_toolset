# Think — G1 Threat Model: EPIC-GOLDEN-TEMPLATES

## Data flows

| # | Flow | Trust boundary crossed |
|---|------|------------------------|
| DF1 | `src/project_root_structure/*` → `assets/golden/*` (build-time sync) | None — both sides are this repo's own source tree, maintainer-controlled |
| DF2 | `assets/golden/*` → `dist/release.zip` (release build) | None — packaging step, same trust level |
| DF3 | `dist/release.zip` → end user's `.claude/skills/ondemand/ts-project-init-advisor/assets/golden/*` (install) | Yes — repo maintainer → end user's machine |
| DF4 | `assets/golden/*` → target project's file system, absent-file case (direct-create) | Yes — packaged content → end user's own project files |
| DF5 | Target project's existing file → advisor's gap-analysis reasoning → `PROJECT_INIT_PLAN.md` MODIFY task text | Yes — end user's own file content → advisor's context window → a generated file the user reads |

## STRIDE per flow

**DF1/DF2 (internal build):**
- Tampering: parity gate (capability #2) is the control — a hand-edited, drifted `assets/golden/` fails the build.
- Repudiation/Info Disclosure/DoS/Elevation: not applicable — no external actor, no secrets, local build only.

**DF3 (install):** covered by the existing installer trust model (GitHub Releases signed by repo ownership, same as every other packaged skill). No new exposure introduced by this epic.

**DF4 (direct-create):**
- Spoofing: N/A — no identity involved.
- Tampering: mitigated by the absent-file guard (never_automate.md item 1) — cannot tamper with something that doesn't exist yet, and post-creation the file is the user's own to edit.
- Repudiation: N/A — local, single-machine, no shared log needed.
- Information Disclosure: the golden templates are public repo content (this project's own `src/project_root_structure/`) — no secrets, no PII. Writing them to a user's project discloses nothing beyond what's already public in this repository.
- Denial of Service: bounded to exactly 5 named files (blast-radius bound); no resource exhaustion vector.
- Elevation of Privilege: N/A — advisor runs with the same file-system permissions the user's own Claude Code session already has; no new privilege is granted.

**DF5 (gap-analysis / MODIFY task):**
- Spoofing: N/A.
- Tampering: the advisor never writes to the existing file itself (never_automate.md item 1) — the only output is task *text* in `PROJECT_INIT_PLAN.md`, which is itself subject to the plan's approval gate before any actual file change happens.
- Repudiation: N/A — local.
- **Information Disclosure (the one real consideration): the user's existing CLAUDE.md/AGENTS.md content enters the advisor's context window during gap analysis.** This is the same exposure that already exists for every other advisor phase (Phase 1-2 already read the target project's files per the advisor's existing SKILL.md) — this epic adds no new category of information the advisor wasn't already reading. No externally-transmitted disclosure: analysis stays in-session, output is a local file.
- Denial of Service: N/A.
- Elevation of Privilege: N/A.

## Privacy data inventory

| Data | Collected? | Stored? | Transmitted? | Retention |
|------|-----------|---------|---------------|-----------|
| Contents of `src/project_root_structure/*` (golden source) | Yes — this repo's own public source | Yes — in the repo, then in `assets/golden/`, then in the shipped zip | Yes — via GitHub Releases, public | Indefinite (public repo history) |
| Contents of target project's existing CLAUDE.md/AGENTS.md (gap-analysis input) | Read into advisor's context window, in-session | Not persisted by this epic beyond the generated `PROJECT_INIT_PLAN.md` task text (which quotes only the *gap*, not full file contents, per capability #3's design) | No — stays local to the user's own Claude Code session | Same lifetime as `PROJECT_INIT_PLAN.md` itself, user-controlled |

No new PII category. No cross-user data flow — every operation is scoped to a single target project, initiated by that project's own user, running locally.

## Auth/authorization model

**N/A — no authentication surface introduced.** This epic adds no API, no service, no credential handling. File-write operations (direct-create) execute with whatever file-system permissions the user's own Claude Code session already holds; the advisor introduces no new privilege boundary. The only "authorization" analog is the existing `PROJECT_INIT_PLAN.md` per-task human-approval gate, already covered under never_automate.md item 2.
