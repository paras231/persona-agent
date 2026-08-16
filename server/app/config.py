from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres
    # Render (and most managed Postgres hosts) hand out a single
    # "postgres://" / "postgresql://" connection string. Accept that as-is
    # for both vars and normalize it to the driver-specific scheme each
    # engine needs.
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/agent"
    database_url_sync: str = "postgresql://postgres:postgres@db:5432/agent"

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_async_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return "postgresql+asyncpg://" + v[len("postgres://") :]
        if v.startswith("postgresql://"):
            return "postgresql+asyncpg://" + v[len("postgresql://") :]
        return v

    @field_validator("database_url_sync", mode="before")
    @classmethod
    def _normalize_sync_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return "postgresql://" + v[len("postgres://") :]
        return v

    # Ollama Cloud (LLM)
    ollama_base_url: str = "https://ollama.com"
    ollama_api_key: str = ""
    ollama_model: str = "gpt-oss:120b"
    llm_temperature: float = 0.7

    # Hugging Face Inference (embeddings)
    hf_api_token: str = ""
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dim: int = 384

    # Memory
    short_term_window: int = 12
    long_term_top_k: int = 5
    memory_importance_threshold: float = 0.5

    # Proactive messaging
    proactive_inactivity_minutes: int = 60 * 12
    proactive_check_interval_seconds: int = 300

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    # Comma-separated list of allowed origins, e.g. "https://myapp.netlify.app".
    # Defaults to "*" since this app has no auth (see main.py CORS setup).
    allowed_origins: str = "*"

    @property
    def cors_origins(self) -> list[str]:
        if self.allowed_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
