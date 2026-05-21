# .claude/ — Claude Code configuration for MoroLex

This folder configures Claude Code to be **fast, focused, and cheap** on this codebase.

## Files at a glance

```
.claude/
├── CLAUDE.md                  # Project memory. Auto-loaded every session. Keep SHORT.
├── settings.json              # Permissions + hooks + default model. Committed.
├── settings.local.example.json # Copy → settings.local.json for personal overrides (gitignored).
├── hooks/                     # Deterministic lifecycle scripts.
│   ├── check-dangerous-commands.sh  # Blocks rm -rf /, git push --force, etc.
│   ├── auto-format.sh                # Runs prettier/ruff after every Edit/Write.
│   └── inject-context.sh             # Adds branch + diff count to every prompt.
├── rules/                     # Short, scoped behavioral rules.
│   ├── python.md
│   ├── typescript.md
│   ├── testing.md
│   └── security.md
├── skills/                    # Reusable knowledge packs. Auto-invoked by Claude based on description.
│   ├── python-ai-service/
│   ├── nestjs-gateway/
│   ├── nextjs-web/
│   ├── rag-pipeline/
│   ├── legal-corpus/
│   ├── prompt-engineering/
│   └── moroccan-legal-domain/
├── agents/                    # Subagents. Isolated context, narrow purpose.
│   ├── retrieval-reviewer.md
│   ├── prompt-auditor.md
│   ├── eval-runner.md
│   ├── migration-planner.md
│   └── codebase-explorer.md
└── commands/                  # Slash commands. Invoked as /<name>.
    ├── bootstrap.md
    ├── add-scraper.md
    ├── new-graph-node.md
    ├── eval-suite.md
    ├── ship.md
    └── explore.md
```

## How this saves tokens

1. **CLAUDE.md is small** (~500 tokens). It loads every turn.
2. **Skills are not loaded** until Claude decides one is relevant — only the description (a few hundred tokens) sits in the system prompt. When invoked, the SKILL.md is read on demand.
3. **Subagents have their own context.** When `codebase-explorer` searches 30 files, none of that lands in your main session. You only see its summary.
4. **Hooks are deterministic.** No tokens spent on Claude double-checking safety rules — the bash hook does it.
5. **Commands are one-shot.** Trigger a workflow with `/ship` instead of explaining it in 200 tokens of prose.

## How to use it

- Edit `CLAUDE.md` whenever architecture changes. Keep it < 1000 tokens.
- Add new skills as new patterns emerge. Never let a skill exceed ~1500 tokens — split it.
- Add new commands for repeated workflows. If you've written the same instructions twice, make it a command.
- Subagents for anything that would otherwise eat 5000+ tokens of exploration.

## Local overrides

Copy `settings.local.example.json` to `settings.local.json` and add your personal preferences. That file is gitignored.

## Updating after Claude Code releases

This folder targets Claude Code's 2026 feature set (skills, subagents, hooks, slash commands). If Anthropic changes file conventions, check https://docs.claude.com/en/docs/claude-code/overview and update accordingly.
