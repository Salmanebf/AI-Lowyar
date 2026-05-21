#!/usr/bin/env bash
# PostToolUse hook for Edit/Write.
# Auto-formats the touched file with the right tool. Silent on success.
# Never blocks — formatting errors shouldn't stop Claude.

set -uo pipefail

input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.path // ""')

if [[ -z "$file" ]] || [[ ! -f "$file" ]]; then
  exit 0
fi

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md)
    if command -v prettier &>/dev/null; then
      prettier --write "$file" &>/dev/null || true
    elif command -v npx &>/dev/null; then
      npx --no-install prettier --write "$file" &>/dev/null || true
    fi
    ;;
  *.py)
    if command -v ruff &>/dev/null; then
      ruff format "$file" &>/dev/null || true
      ruff check --fix "$file" &>/dev/null || true
    fi
    ;;
esac

exit 0
