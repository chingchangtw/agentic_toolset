#!/usr/bin/env node
/**
 * sync-golden-templates.mjs
 * Developer-run sync: copies the five agent-context files from
 * src/project_root_structure/ into the ts-project-init-advisor skill's
 * assets/golden/ directory. Run after editing src/project_root_structure/
 * and commit the result alongside the source change.
 * Run: node scripts/sync-golden-templates.mjs  (or via `npm run sync-golden`)
 */
import { syncGoldenTemplates, GOLDEN_FILES } from './lib/golden-templates.mjs';

syncGoldenTemplates();
console.log(`✓ synced ${GOLDEN_FILES.length} golden templates`);
for (const file of GOLDEN_FILES) console.log(`  ${file}`);
