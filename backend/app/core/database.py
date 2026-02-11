import ssl as _ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def _fix_asyncpg_url(url: str) -> tuple[str, dict]:
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    needs_ssl = params.pop("sslmode", [None])[0] in ("require", "verify-ca", "verify-full")
    params.pop("channel_binding", None)
    clean_query = urlencode({k: v[0] for k, v in params.items()}, doseq=False)
    clean_url = urlunparse(parsed._replace(query=clean_query))
    connect_args: dict = {}
    if needs_ssl:
        ctx = _ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = _ssl.CERT_NONE
        connect_args["ssl"] = ctx
    return clean_url, connect_args


_db_url, _connect_args = _fix_asyncpg_url(settings.database_url)

engine = create_async_engine(
    _db_url,
    echo=False,
    connect_args=_connect_args,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
