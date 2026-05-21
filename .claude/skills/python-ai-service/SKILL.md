---
name: python-ai-service
description: "Use this skill when working in apps/ai-service/ — anything involving FastAPI routes, LangGraph state machines, LLM clients, Pydantic models, RAG flow, retrieval, prompt assembly, or the Python AI codebase. Triggers on: 'AI service', 'FastAPI', 'LangGraph', 'agent flow', 'retrieval node', 'embed', 'Qdrant query', 'streaming response', or any edit under apps/ai-service/."
---

# Python AI Service — patterns and conventions

## Layout

```
apps/ai-service/
├── app/
│   ├── main.py              # FastAPI app entrypoint
│   ├── config.py            # pydantic-settings
│   ├── api/
│   │   ├── routes/
│   │   │   ├── ask.py       # POST /ask — main RAG endpoint, streams SSE
│   │   │   └── health.py
│   │   └── deps.py          # FastAPI dependencies (auth, request_id)
│   ├── graph/               # LangGraph
│   │   ├── state.py         # TypedDict state
│   │   ├── nodes/
│   │   │   ├── detect_language.py
│   │   │   ├── classify_domain.py
│   │   │   ├── retrieve.py
│   │   │   ├── rerank.py
│   │   │   ├── synthesize.py
│   │   │   └── guardrail.py
│   │   └── build.py         # graph wiring
│   ├── llm/
│   │   ├── client.py        # the ONE abstraction. all LLM calls go here.
│   │   └── models.py        # model registry: name → provider/cost/context
│   ├── retrieval/
│   │   ├── qdrant.py        # qdrant client wrapper
│   │   ├── hybrid.py        # BM25 + vector (v5+)
│   │   └── filters.py       # build qdrant filter from query metadata
│   ├── prompts/
│   │   └── loader.py        # loads from packages/prompts/ (versioned)
│   ├── guardrails/
│   │   ├── citation.py      # ensures answer cites a real article
│   │   └── injection.py     # prompt-injection detection
│   ├── observability/
│   │   └── langfuse.py
│   ├── errors.py
│   └── logging.py           # structlog setup
└── tests/
    ├── unit/
    └── integration/
```

## LangGraph state pattern

```python
from typing import TypedDict, Literal
from langgraph.graph import StateGraph

class AskState(TypedDict, total=False):
    # Inputs
    question: str
    conversation_id: str
    user_lang_hint: str | None

    # Derived
    detected_language: Literal["fr", "ar"]
    domain: Literal["labor_law", "commercial", "family", "unknown"]
    retrieved_chunks: list[dict]
    reranked_chunks: list[dict]

    # Outputs
    answer: str
    citations: list[dict]
    refused: bool
    refusal_reason: str | None
```

## LLM call pattern

```python
# ALWAYS like this:
from app.llm.client import llm

response = await llm.complete(
    model="sonnet",                       # name from registry
    system=prompts.load("answer_v3", lang=lang),
    messages=[...],
    stream=True,
    metadata={"conversation_id": cid},    # for Langfuse
)

# NEVER like this:
# import anthropic
# client = anthropic.AsyncAnthropic(...)  # forbidden outside llm/client.py
```

## Adding a new graph node — checklist

1. Create `app/graph/nodes/<name>.py` with a single `async def <name>(state: AskState) -> AskState` function.
2. Pure: read from state, return updated state. No side effects except logging and observability.
3. Add unit test in `tests/unit/graph/test_<name>.py` mocking external calls.
4. Wire into `app/graph/build.py` with explicit edges.
5. Document the node's contract in a docstring.

## Streaming SSE

The route handler returns `StreamingResponse(content=stream_generator(), media_type="text/event-stream")`. The generator yields lines formatted as `data: <json>\n\n`. Each event has shape `{"type": "token"|"citation"|"done"|"error", "data": ...}`.

## Common commands

```bash
# Dev server with reload
uv run uvicorn app.main:app --reload --port 8000

# Tests
uv run pytest                              # all
uv run pytest tests/unit -x                # fail fast
uv run pytest -k "test_retrieve"           # by name
uv run pytest --cov=app --cov-report=term

# Quality
uv run ruff format .
uv run ruff check . --fix
uv run mypy app
```
