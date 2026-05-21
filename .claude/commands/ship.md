---
description: "Run the full pre-PR check: lint, type-check, tests across all packages, then summarize. Refuses to declare ready if anything fails."
---

Run, in order, and STOP at the first failure:

```bash
# 1. TypeScript: lint + types + tests
pnpm lint
pnpm --filter gateway exec tsc --noEmit
pnpm --filter web exec tsc --noEmit
pnpm test

# 2. Python: ruff + mypy + pytest
cd apps/ai-service
uv run ruff check .
uv run ruff format --check .
uv run mypy app
uv run pytest -q
cd ../..

# 3. Ingestion (if changed)
# Run only if git diff includes ingestion/
if git diff --cached --name-only | grep -q '^ingestion/'; then
  cd ingestion
  uv run ruff check .
  uv run pytest -q
  cd ..
fi

# 4. Migrations
if git diff --cached --name-only | grep -q 'prisma/schema.prisma'; then
  echo "schema.prisma changed — verify migration exists in prisma/migrations/"
fi
```

If ALL pass:
```
✅ READY TO SHIP

Changed:
<list of changed files grouped by app>

Suggested commit message (Conventional Commits):
<type>(<scope>): <summary>
```

If anything fails:
```
❌ NOT READY

Failure:
<which step, with the exact error>

Fix it before shipping. Re-run /ship after.
```
