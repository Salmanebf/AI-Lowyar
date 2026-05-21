#!/usr/bin/env bash
# UserPromptSubmit hook.
# Injects minimal current-state context so Claude doesn't waste tokens re-discovering it.
# Output to stdout is appended to the user's prompt as additional context.
# Keep output SHORT — every line costs tokens on every turn.

set -uo pipefail

# Only inject when at the repo root (avoid noise in unrelated dirs)
if [[ ! -f "package.json" ]] && [[ ! -f "pnpm-workspace.yaml" ]]; then
  exit 0
fi

branch=$(git branch --show-current 2>/dev/null || echo "?")
changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

# Compact one-liner. Update if/when it stops being useful.
echo "<project_state>branch=$branch, uncommitted_files=$changes</project_state>"

exit 0
