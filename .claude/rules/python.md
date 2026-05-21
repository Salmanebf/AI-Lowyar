# Python rules (apps/ai-service/ and ingestion/)

- Python 3.11+. `uv` is the package manager. `uv add <pkg>`, `uv sync`, `uv run pytest`.
- `from __future__ import annotations` at the top of every module with type hints.
- Pydantic v2 for all I/O models. No raw dicts crossing boundaries.
- FastAPI routes are thin: validate → call service → return. No logic in route handlers.
- Async everywhere on the request path. Use `httpx.AsyncClient`, never `requests`.
- LLM calls go through `app/llm/client.py`. Never instantiate Anthropic/OpenAI clients elsewhere.
- LangGraph state objects are typed `TypedDict`s; never plain dicts.
- Errors: domain-specific exceptions in `app/errors.py`. Routes catch + map to HTTP.
- Logging: `structlog`, never `print`. Include `conversation_id` in context.
- Tests: `pytest` with `pytest-asyncio`. Mock LLM and Qdrant calls in unit tests; use real services only in `tests/integration/`.
- Format: `ruff format`. Lint: `ruff check`. Types: `mypy --strict` (relaxed only for `tests/`).

Never:
- Mix sync and async in the same call path.
- Hardcode prompts in feature code (use `packages/prompts/`).
- Catch bare `Exception` (use specific types or `BaseError` from `app/errors.py`).
