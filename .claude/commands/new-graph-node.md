---
description: "Add a new LangGraph node to the ask pipeline. Usage: /new-graph-node <node_name> <one-line purpose>"
---

You are adding a LangGraph node: $ARGUMENTS

Follow the `python-ai-service` skill exactly:

1. Create `apps/ai-service/app/graph/nodes/<node_name>.py` with:
   - `async def <node_name>(state: AskState) -> AskState`
   - Pure function: read state, return updated state
   - Logging with `structlog`, include `conversation_id`
   - Type hints + docstring describing inputs/outputs/side effects
2. If new state fields are needed, update `apps/ai-service/app/graph/state.py`.
3. Wire into `apps/ai-service/app/graph/build.py` with the correct edges. Ask which existing node it should sit between if not obvious from purpose.
4. Add unit test `apps/ai-service/tests/unit/graph/test_<node_name>.py` mocking any external dependency.
5. If the node calls the LLM, route through `app.llm.client.llm.complete()` only.

End with: the test passes, mypy is clean, ruff has no findings.
