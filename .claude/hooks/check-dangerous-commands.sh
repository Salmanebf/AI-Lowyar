#!/usr/bin/env bash
# PreToolUse hook for Bash commands.
# Reads JSON from stdin, blocks dangerous patterns deterministically.
# Exit 0 = allow, exit 2 = block (Claude sees the stderr message).

set -euo pipefail

# Read tool input JSON
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // ""')

if [[ -z "$cmd" ]]; then
  exit 0
fi

# Block patterns we never want, even if Claude misjudges
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf \$HOME"
  "rm -rf ~/"
  "> /dev/sda"
  "mkfs"
  ":(){:|:&};:"
  "chmod -R 777 /"
  "chown -R "
  "git push --force"
  "git push -f"
  "DROP DATABASE"
  "DROP TABLE"
  "TRUNCATE"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$cmd" == *"$pattern"* ]]; then
    echo "BLOCKED by pre-bash hook: pattern '$pattern' detected in command." >&2
    echo "If this is intentional, run it manually outside Claude Code." >&2
    exit 2
  fi
done

# Warn (not block) on commands that touch production env files
if [[ "$cmd" == *".env.production"* ]] || [[ "$cmd" == *"prod.env"* ]]; then
  echo "WARNING: command touches a production env file. Proceeding, but double-check." >&2
fi

exit 0
