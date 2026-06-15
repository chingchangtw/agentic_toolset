# reference: GitHub MCP traceability

## Plan

- `create_branch` from main using feature/change name

## Build

- `push_files` with commit slices tied to tasks

## Review

- `create_pull_request`
- `create_review_comment` for significant findings

## Test

- `update_pull_request_review` with acceptance/mutation status

## Ship

- `merge_pull_request` (squash policy as configured)
- `create_release` with change summary

This chain is optional per project until `github-mcp` tier is active.

