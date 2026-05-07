from collections.abc import AsyncIterator

from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from project_roast_api.config import settings


def sanitize_async_database_url(database_url: str) -> str:
    url = make_url(database_url)
    query = dict(url.query)
    sslmode = query.pop("sslmode", None)
    query.pop("channel_binding", None)

    if sslmode == "require":
        query["ssl"] = "require"

    url = url.set(query=query)
    return str(url)


engine: AsyncEngine = create_async_engine(
    sanitize_async_database_url(settings.database_url),
    connect_args={"statement_cache_size": 0, "prepared_statement_cache_size": 0},
    pool_pre_ping=True,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session
