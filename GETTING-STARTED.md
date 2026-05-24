# Getting Started with MoroLex

## Prerequisites

- Node.js >= 20, pnpm >= 9
- Python >= 3.11, [uv](https://docs.astral.sh/uv/)
- Docker + Docker Compose

## Step 1 — Install dependencies

```bash
pnpm install
cd apps/ai-service && uv sync --extra dev && cd ../..
```

## Step 2 — Start infrastructure

```bash
docker compose -f infra/docker-compose.yml up -d
```

This starts Postgres 16 (5432), Qdrant (6333), and Redis (6379) with persistent volumes.

## Step 3 — Configure environment

```bash
cp .env.example .env
```

Fill in real values for `JWT_SECRET`, `MOROLEX_ANTHROPIC_API_KEY`, and `MOROLEX_COHERE_API_KEY`. The rest works with defaults for local dev.

## Step 4 — Generate Prisma client and run migrations

```bash
pnpm --filter @morolex/gateway exec prisma generate
# Migrations will be added once the schema is defined
```

## Step 5 — Start dev servers

In three terminals:

```bash
# Terminal 1: Gateway (port 3000)
pnpm --filter @morolex/gateway dev

# Terminal 2: Web (port 3001)
pnpm --filter @morolex/web dev

# Terminal 3: AI Service (port 8000)
cd apps/ai-service && uv run uvicorn app.main:app --reload --port 8000
```

## Step 6 — Verify the stack

Visit http://localhost:3001/fr/test-stack — you should see health status for all services.

Or test individually:

```bash
curl http://localhost:3000/health   # Gateway + Postgres + AI Service
curl http://localhost:8000/health   # AI Service + Qdrant
```

## Running tests

```bash
pnpm test                                              # All TS packages
cd apps/ai-service && uv run pytest tests/ -v          # Python AI service
cd packages/prompts && python -m pytest tests/ -v      # Python prompt loader
```

## Project structure

See the top-level [README.md](./README.md) for architecture details.

## Claude Code integration

The `.claude/` folder configures Claude Code for this codebase. Skills, agents, and slash commands are auto-loaded. Key commands:

- `/explore <question>` — Search the codebase without polluting context
- `/ship` — Pre-PR checks (lint, types, tests)
- `/add-scraper <name> <url>` — Scaffold a new legal source scraper
- `/new-graph-node <name> <purpose>` — Add a LangGraph node
- `/eval-suite <name> <count>` — Generate eval test cases

## Next steps

1. Define the Prisma schema for users, conversations, messages, feedback, and legal_documents
2. Build the first scraper for Code du Travail from SGG.gov.ma
3. Implement the article-based chunker and Cohere embedder
4. Set up the LangGraph ask flow end-to-end
5. Wire up the web chat UI with SSE streaming
