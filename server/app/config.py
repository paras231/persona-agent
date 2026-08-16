from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/agent"
    database_url_sync: str = "postgresql://postgres:postgres@db:5432/agent"

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


@lru_cache
def get_settings() -> Settings:
    return Settings()
