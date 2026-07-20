# Layer Map and Architecture Check

`layers.map.json` is canonical. Version 1 shape:

```json
{
  "version": "1",
  "layers": [
    { "name": "domain", "globs": ["src/domain/**"], "may_import": ["domain"] }
  ],
  "aliases": { "@domain/": "src/domain" },
  "external": { "allow": true }
}
```

Only `*` within one path segment and whole-segment `**` are supported. Every
scanned source file must match exactly one layer. Relative imports and declared
aliases resolve inside canonical project root; traversal and symlink escape fail.

Run:

```text
node src/scripts/pl-arch-check.mjs --root <project> --manifest <layers.map.json> --format json
```

Supported files: `.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, `.cjs`.
Supported dependencies: static import-from, side-effect import, re-export-from,
literal `import()`, literal `require()`. Non-literal dynamic dependencies fail closed.

