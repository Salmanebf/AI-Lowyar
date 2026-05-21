---
description: "Bootstrap the MoroLex monorepo from scratch: pnpm workspaces, NestJS, Next.js, FastAPI, Docker Compose, Prisma. Run only once at project start."
---

You are bootstrapping the MoroLex monorepo. Do this systematically.

## Phase 1 — Workspace skeleton

1. Init `pnpm` with `pnpm-workspace.yaml` listing `apps/*` and `packages/*`.
2. Add `turbo.json` with `dev`, `build`, `lint`, `test` pipelines.
3. Add root `package.json` with `turbo` as devDependency.
4. Add `.gitignore` covering: `node_modules`, `.env*`, `.next`, `dist`, `__pycache__`, `.venv`, `.turbo`, `raw/` (for ingestion).
5. Add `.editorconfig`, `.prettierrc`, `.prettierignore`.

## Phase 2 — apps/gateway (NestJS)

```bash
pnpm dlx @nestjs/cli new apps/gateway --package-manager pnpm --skip-git
```

Then add: `prisma`, `@prisma/client`, `zod`, `passport`, `@nestjs/passport`, `@nestjs/jwt`, `@nestjs/throttler`, `nestjs-telegraf`, `telegraf`, `pino`, `nestjs-pino`.

Init Prisma with `--datasource-provider postgresql`. Stop before writing models — that's a separate command.

## Phase 3 — apps/web (Next.js)

```bash
pnpm create next-app apps/web --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
```

Then add: `shadcn` (init it), `zod`, `react-hook-form`, `@hookform/resolvers`, `zustand`, `@tanstack/react-query`.

Set up i18n folder structure and middleware for `/fr` and `/ar` locales.

## Phase 4 — apps/ai-service (Python)

```bash
mkdir -p apps/ai-service && cd apps/ai-service
uv init --name morolex-ai
uv add fastapi uvicorn[standard] pydantic-settings httpx structlog \
       langgraph langchain-anthropic cohere qdrant-client \
       python-multipart sse-starlette
uv add --dev pytest pytest-asyncio mypy ruff respx
```

Create the layout described in the `python-ai-service` skill.

## Phase 5 — packages/

Create `packages/shared-types/` (TS types shared by web + gateway) and `packages/prompts/` (the prompt registry).

## Phase 6 — infra/

Create `docker-compose.yml` with services: `postgres:16`, `qdrant/qdrant`, `redis:7`. Add a `.env.example` at root listing every variable used anywhere in the project.

## Phase 7 — Final checks

- `pnpm install` succeeds at root
- `docker compose up -d` brings up Postgres, Qdrant, Redis healthy
- `pnpm --filter gateway dev` boots without errors
- `pnpm --filter web dev` boots without errors
- `cd apps/ai-service && uv run uvicorn app.main:app --reload` boots and `/health` responds 200

Commit each phase as a separate git commit with a Conventional Commits message.
