from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_prefix": "MOROLEX_"}

    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    anthropic_api_key: str = ""
    cohere_api_key: str = ""

    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "legal_corpus"

    gateway_url: str = "http://localhost:3000"


settings = Settings()
