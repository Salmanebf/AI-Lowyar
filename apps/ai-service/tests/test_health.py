from __future__ import annotations

import httpx
import respx
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


@respx.mock
def test_health_returns_ok_when_qdrant_up() -> None:
    respx.get(f"{settings.qdrant_url}/healthz").mock(
        return_value=httpx.Response(200, text="ok"),
    )
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["checks"]["ai_service"] == "ok"
    assert data["checks"]["qdrant"] == "ok"


@respx.mock
def test_health_returns_degraded_when_qdrant_down() -> None:
    respx.get(f"{settings.qdrant_url}/healthz").mock(side_effect=httpx.ConnectError("refused"))
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["checks"]["qdrant"] == "error"


def test_config_reads_env_vars(monkeypatch: object) -> None:
    assert settings.qdrant_collection == "legal_corpus"
    assert settings.port == 8000
