# Getting Started with Claude Code for MoroLex

This is your **day-one playbook**. Follow it in order.

---

## Step 1 — Initialize the GitHub repository (15 min)

1. Create a new private GitHub repo: `morolex` (or whatever name you settle on).
2. Locally:
   ```bash
   mkdir morolex && cd morolex
   git init
   git remote add origin git@github.com:<you>/morolex.git
   ```
3. Copy the `.claude/` folder from this delivery into the repo root.
4. Copy `SPECIFICATIONS.md` to `docs/SPECIFICATIONS.md`.
5. Create `.gitignore` at the repo root with at least:
   ```
   node_modules/
   .env*
   !.env.example
   .next/
   dist/
   __pycache__/
   .venv/
   .turbo/
   *.log
   .DS_Store
   raw/
   ```
6. First commit:
   ```bash
   git add .
   git commit -m "chore: initial scaffold with claude config and specs"
   git branch -M main
   git push -u origin main
   ```

---

## Step 2 — Connect Claude Code to the repo (5 min)

You said you use Claude Code at `https://claude.ai/code` connected to GitHub repos. After pushing:

1. Open https://claude.ai/code
2. Connect / select the `morolex` repo.
3. Claude Code will automatically pick up `.claude/CLAUDE.md`, `.claude/settings.json`, the skills, the agents, and the slash commands.

Verify by typing `/` in a chat — you should see your custom commands: `/bootstrap`, `/add-scraper`, `/new-graph-node`, `/eval-suite`, `/ship`, `/explore`.

---

## Step 3 — First session: bootstrap the monorepo (60-90 min)

In Claude Code, run:

```
/bootstrap
```

This runs the multi-phase scaffold defined in `.claude/commands/bootstrap.md`. Claude will:
- Set up pnpm workspaces + Turborepo
- Generate the NestJS gateway
- Generate the Next.js web app
- Generate the FastAPI AI service
- Create the Docker Compose dev environment

**Review and commit each phase as you go.** Don't blindly accept all changes — read the diffs. This is also how you learn the codebase you'll be living in.

---

## Step 4 — Phase 1 from the roadmap: knowledge base

Once the scaffold is committed, start the actual work. Suggested sequence of prompts to Claude Code:

1. *"Let's start with the Postgres schema. Generate the `legal_documents` table per the SPECIFICATIONS, plus the Prisma schema for users / conversations / messages / feedback / usage_logs."*
2. *"Now create the first scraper for SGG.gov.ma. Use /add-scraper sgg https://www.sgg.gov.ma"*
3. *"Build the article-based chunker per the rag-pipeline skill, with tests against a fixture of the first 10 articles of Code du Travail."*
4. *"Set up the Cohere embedder + Qdrant collection per the rag-pipeline skill."*
5. *"Add an `evals/labor_law.jsonl` with 30 cases. Use /eval-suite labor_law 30"*

---

## Step 5 — Daily workflow

**Starting a session**: just open Claude Code. CLAUDE.md and the skill descriptions load automatically. Don't paste context — it's already there.

**Before any non-trivial change**: `/explore <question>` to investigate without polluting your context.

**When adding code**: skills auto-invoke. You can also explicitly say *"use the python-ai-service skill"* if Claude picks the wrong one.

**Before committing**: `/ship` runs all checks and tells you if you're ready.

**When reviewing risky changes**: invoke subagents explicitly. *"Use the retrieval-reviewer agent on the changes in app/retrieval/qdrant.py"*.

---

## Token-saving tips specific to this setup

1. **Don't re-explain the architecture.** CLAUDE.md has it. If Claude asks where something goes, point at the relevant skill instead of pasting code.
2. **Use `/explore` aggressively.** A subagent search uses ~1-2k tokens once. Letting Claude grep the codebase in the main context can burn 10-20k.
3. **Keep commits small and frequent.** Smaller diffs = smaller context per session.
4. **Use Sonnet 4.6 by default** (set in settings.json). Switch to Opus only for hard problems — note this in `/model` for that session.
5. **Don't paste large legal texts into chat.** Reference them by path. Claude will read what it needs.
6. **Compact sessions.** When a session gets long, use Claude Code's "Compact" feature to summarize old turns. Or just start a new session for the next task — CLAUDE.md will re-establish context.

---

## When things go wrong

- **Claude ignores a rule** → check that the rule is referenced from CLAUDE.md or that the relevant skill description matches your task.
- **Hooks block something you actually need** → edit `.claude/hooks/check-dangerous-commands.sh` to narrow the pattern. Reload by closing/reopening Claude Code.
- **A skill keeps NOT triggering** → its `description` field needs more specific trigger keywords matching what you actually type.
- **A skill triggers too often** → tighten the description to only fire in the right contexts.

---

## Next milestones

- After scaffold: implement the chunker + embedder + Qdrant indexer for Code du Travail (FR + AR). Goal: a working `python -m ingestion.pipeline --code code_travail` end-to-end.
- After ingestion: implement the LangGraph `ask` flow end-to-end with one route. Goal: `curl POST /ask` returns a streamed, cited answer to a labor-law question.
- After AI service works standalone: wire it up to the gateway + web chat UI. Goal: a working chat at `localhost:3000`.

Refer back to `docs/SPECIFICATIONS.md` Section 6 (Roadmap) for the full phased plan.

---

Good luck. Build something solid.
