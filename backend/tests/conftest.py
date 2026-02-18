import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.main import app
from app.core.database import get_db, engine


@pytest.fixture
async def db_session():
    """Session in a transaction that is rolled back after the test (no persisted data)."""
    async with engine.connect() as conn:
        trans = await conn.begin()
        async_session_factory = async_sessionmaker(
            bind=conn,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        try:
            async with async_session_factory() as session:
                yield session
        finally:
            await trans.rollback()


@pytest.fixture
async def client(db_session):
    """HTTP client with get_db overridden to use the rollback session."""
    async def get_db_override():
        yield db_session

    app.dependency_overrides[get_db] = get_db_override
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac
    finally:
        app.dependency_overrides.clear()
