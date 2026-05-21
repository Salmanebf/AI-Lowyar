# MoroLex — Moroccan Legal AI Assistant

You are working on **MoroLex**, a specialized legal AI assistant for Moroccan law (Labor Law at v1, all domains long-term). Languages: French + Arabic. Channels: Web (Next.js) + Telegram.

## Architecture (CRITICAL — read before any cross-service change)

Three apps in a monorepo:
- `apps/web/` — Next.js 14+ App Router, Tailwind, shadcn/ui. Chat UI. Streams SSE.
- `apps/gateway/` — NestJS (TypeScript). Auth, billing, rate limits, Telegram bot, conversation persistence. Calls AI service over internal HTTP.
- `apps/ai-service/` — Python 3.11+ FastAPI + LangGraph. RAG, prompt building, LLM calls. NEVER add business logic here.

Data layer:
- Postgres 16 (users, conversations, messages, feedback, legal_documents)
- Qdrant (vector store for legal corpus, collection: `legal_corpus`)
- Redis (cache + queues + rate-limit counters)

Ingestion (separate pipeline, not a service):
- `ingestion/` — scrapers → parsers → normalizer → chunker → embedder → Qdrant

## Hard rules

1. **Citations are mandatory.** No legal answer ships without article-level citations. If retrieval returns nothing relevant, the AI must refuse, not improvise.
2. **Chunk by article, never by token count.** Every chunk maps to a real article with metadata `{code, article_number, language, version_date}`.
3. **Two backends, two languages.** TS in `apps/gateway/`, Python in `apps/ai-service/`. Don't try to port AI logic to TS.
4. **No business logic in the AI service.** Auth, rate-limits, billing live in the gateway only.
5. **Every LLM call goes through the LLM abstraction.** Never call Anthropic/OpenAI clients directly from feature code.
6. **Prompts are versioned files** in `packages/prompts/`, not inline strings.
7. **Streaming is the default** for chat endpoints (SSE end-to-end).
8. **Legal corpus is versioned.** When a law changes, keep history. Never delete `legal_documents` rows; set `is_current=false`.
9. **Loi 28-08 compliance.** Every assistant response carries a disclaimer. Never frame output as "legal advice."

## Stack at-a-glance

- TS: pnpm workspaces, Turborepo, NestJS, Prisma, Next.js App Router, Zod, Vitest
- Python: uv, FastAPI, LangGraph, langchain-anthropic, cohere, qdrant-client, pydantic v2, pytest
- Infra: Docker Compose (dev), Hetzner VPS (prod), Caddy reverse proxy
- Observability: Sentry + Langfuse

## File conventions

- TS: `kebab-case` filenames, `PascalCase` types, `camelCase` functions.
- Python: `snake_case` everywhere, type hints mandatory, `from __future__ import annotations` at top.
- Tests: `*.spec.ts` (TS), `test_*.py` (Python). Co-locate with source.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).

## Languages in the product (not code)

User-facing content is **French and Arabic**. When generating example data, fixtures, prompts, or test cases, use realistic legal French/Arabic — not English placeholders.

## When unsure

- Architecture question → read `docs/SPECIFICATIONS.md`.
- "How do I X" pattern → check `.claude/skills/`.
- Domain question (Moroccan law, code structure) → invoke the `moroccan-legal-domain` skill.

Keep responses focused. Don't restate context. Don't add preamble. Do the work.
