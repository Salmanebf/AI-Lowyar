from __future__ import annotations

from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, Any

import httpx
from fastapi import FastAPI

from app.config import settings
from app.logging import setup_logging

if TYPE_CHECKING:
    from collections.abc import AsyncIterator


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    setup_logging(debug=settings.debug)
    yield


app = FastAPI(
    title="MoroLex AI Service",
    version="0.0.1",
    lifespan=lifespan,
)


@app.get("/health")
async def health() -> dict[str, Any]:
    checks: dict[str, str] = {"ai_service": "ok"}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{settings.qdrant_url}/healthz")
            checks["qdrant"] = "ok" if resp.status_code == 200 else "error"
    except Exception:
        checks["qdrant"] = "error"

    overall = "ok" if all(v == "ok" for v in checks.values()) else "degraded"
    return {"status": overall, "checks": checks}
