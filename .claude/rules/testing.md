# Testing rules

- New code requires tests. Bug fixes require a regression test that fails before the fix.
- Unit tests: mock external dependencies (Qdrant, LLM APIs, Postgres for Python; database for NestJS via Prisma test client).
- Integration tests live separately (`tests/integration/` Python; `__tests__/integration/` TS) and may hit real local services via docker-compose.
- For RAG/LLM behavior: maintain `evals/labor_law.jsonl` — JSONL of `{question, expected_articles, expected_concepts}`. Add cases as bugs are found.
- Snapshot tests are allowed for stable structured outputs (citations, parsed legal docs) but NOT for free-text LLM responses.
- Always run tests before declaring a task done:
  - TS: `pnpm test --filter <package>`
  - Python: `uv run pytest apps/ai-service/tests`
