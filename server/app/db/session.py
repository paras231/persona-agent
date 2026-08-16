from collections.abc import AsyncIterator
from urllib.parse import urlparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings

settings = get_settings()

# asyncpg needs an explicit ssl connect arg (it doesn't read "sslmode" from the
# URL like psycopg does). Any host that isn't the local/docker-compose db
# needs TLS, e.g. a managed Postgres like Render's.
_db_host = urlparse(settings.database_url).hostname or ""
_connect_args = {"ssl": "require"} if _db_host not in ("db", "localhost", "127.0.0.1") else {}

engine = create_async_engine(settings.database_url, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
