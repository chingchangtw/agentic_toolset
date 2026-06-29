## ADDED Requirements

### Requirement: Shell wrapper resolves bridge script at runtime

The wrapper script `ts-statusline_wrapper.sh` SHALL resolve the bridge executable by existence check: if `ts-statusline_bridge.sh` is present in the hooks directory it SHALL be invoked; otherwise `ts-statusline_bridge.py` SHALL be invoked as fallback. The resolution SHALL NOT use error-code chaining (`||`) because a non-zero exit on parse failure would silently trigger the fallback.

#### Scenario: .sh bridge absent, .py bridge present

- **WHEN** `ts-statusline_bridge.sh` does not exist in the hooks directory
- **THEN** the wrapper invokes `ts-statusline_bridge.py` and produces non-empty output with exit code 0

#### Scenario: .sh bridge present

- **WHEN** `ts-statusline_bridge.sh` exists in the hooks directory
- **THEN** the wrapper invokes `ts-statusline_bridge.sh` (not the .py bridge)

### Requirement: PS1 bridge writes BOM-free UTF-8 state file

`ts-statusline_bridge.ps1` SHALL write the context state file as UTF-8 without BOM using `[System.IO.File]::WriteAllText` with `UTF8Encoding::new($false)`. The state file SHALL be parseable by `json.loads()` without stripping any leading bytes.

#### Scenario: State file parsed by Python json.loads

- **WHEN** `ts-statusline_bridge.ps1` writes the state file
- **THEN** `json.loads(open(state_file, encoding="utf-8").read())` succeeds without raising `UnicodeDecodeError` or `json.JSONDecodeError`

### Requirement: Python bridge handles null and absent used_percentage

`ts-statusline_bridge.py` SHALL extract `ctx_pct` without raising `TypeError` when `context_window.used_percentage` is JSON `null` or absent. When `used_percentage` is `null` or absent, the bridge SHALL compute `ctx_pct` from `current_tokens / max_tokens * 100`. When both `used_percentage` and token counts are absent or `max_tokens` is 0, `ctx_pct` SHALL be `0.0`.

#### Scenario: used_percentage is null, token counts present

- **WHEN** the payload contains `{"context_window": {"used_percentage": null, "current_tokens": 500, "max_tokens": 1000}}`
- **THEN** `ctx_pct` equals `50.0` and the state file is written successfully

#### Scenario: used_percentage absent, token counts present

- **WHEN** the payload contains `{"context_window": {"current_tokens": 800, "max_tokens": 1000}}`
- **THEN** `ctx_pct` equals `80.0` and the state file is written successfully

#### Scenario: context_window entirely absent

- **WHEN** the payload contains no `context_window` key
- **THEN** `ctx_pct` equals `0.0` and the state file is written successfully without raising any exception

##### Example: boundary values

| used_percentage | current_tokens | max_tokens | Expected ctx_pct |
| --------------- | -------------- | ---------- | ---------------- |
| 75.5            | (ignored)      | (ignored)  | 75.5             |
| null            | 500            | 1000       | 50.0             |
| null            | 0              | 0          | 0.0              |
| absent          | 800            | 1000       | 80.0             |
| absent          | absent         | absent     | 0.0              |
