import secrets
import string
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wishlist import Wishlist


def generate_slug() -> str:
    alphabet = string.ascii_lowercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(12))


async def get_unique_slug(db: AsyncSession) -> str:
    while True:
        slug = generate_slug()
        result = await db.execute(select(Wishlist).where(Wishlist.slug == slug))
        if result.scalar_one_or_none() is None:
            return slug
