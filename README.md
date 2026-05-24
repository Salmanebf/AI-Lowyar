# MoroLex — Moroccan Legal AI Assistant

A specialized legal AI assistant for Moroccan law. French + Arabic. Web + Telegram.

## Architecture

```
apps/
├── gateway/        NestJS — auth, billing, rate limits, Telegram bot, Prisma
├── web/            Next.js 14 — chat UI, i18n (fr/ar), shadcn/ui
└── ai-service/     FastAPI + LangGraph — RAG, prompts, LLM calls, Qdrant

packages/
├── shared-types/   Cross-service TypeScript types
└── prompts/        Versioned prompt files + dual TS/Python loaders

infra/
└── docker-compose.yml   Postgres 16, Qdrant, Redis 7
```

## Quick start

```bash
# 1. Clone and install
pnpm install
cd apps/ai-service && uv sync --extra dev && cd ../..

# 2. Start data stores
docker compose -f infra/docker-compose.yml up -d

# 3. Copy env vars
cp .env.example .env   # then fill in real values

# 4. Generate Prisma client
pnpm --filter @morolex/gateway exec prisma generate

# 5. Run dev servers
pnpm dev                          # gateway (3000) + web (3001)
cd apps/ai-service && uv run uvicorn app.main:app --reload --port 8000
```

## Health check chain

```
Web /api/health → Gateway /health → AI Service /health → Qdrant /healthz
```

Visit `http://localhost:3001/fr/test-stack` to see live status of the full stack.

## Stack

| Layer        | Tech                                                |
|-------------|-----------------------------------------------------|
| Frontend    | Next.js 14, Tailwind, shadcn/ui, Zustand, TanStack Query |
| Gateway     | NestJS, Prisma, Passport JWT, Telegraf              |
| AI Service  | FastAPI, LangGraph, langchain-anthropic, Cohere, Qdrant |
| Data        | Postgres 16, Qdrant, Redis 7                        |
| Prompts     | Versioned markdown, `{{var}}` substitution, dual loaders |
| Infra       | Docker Compose (dev), Hetzner VPS (prod), Caddy     |

## Testing

```bash
pnpm test                                          # all TS packages
cd apps/ai-service && uv run pytest tests/ -v      # Python
```

## What's done (bootstrap)

- [x] Monorepo scaffold (pnpm workspaces, Turborepo)
- [x] NestJS gateway with /health, Prisma, AI service client
- [x] Next.js web app with i18n (fr/ar), shadcn/ui, /test-stack page
- [x] FastAPI AI service with /health, Qdrant health check, structlog
- [x] Versioned prompts with dual loaders (TS + Python) and tests
- [x] Docker Compose dev stack (Postgres, Qdrant, Redis)
- [x] Full health check chain: Web → Gateway → AI Service → Qdrant

## What's next

- [ ] Prisma schema for users, conversations, messages, feedback, legal_documents
- [ ] First scraper for SGG.gov.ma legal texts
- [ ] Article-based chunker + Cohere embedder + Qdrant indexer
- [ ] LangGraph `ask` flow with retrieval → prompt → LLM → citations
- [ ] Gateway auth (JWT + OAuth) and rate limiting
- [ ] Web chat UI with SSE streaming
- [ ] Telegram bot integration
