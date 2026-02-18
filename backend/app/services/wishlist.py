from decimal import Decimal
from uuid import UUID

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.wishlist import Wishlist, WishlistItem, Reservation, Contribution
from app.schemas.wishlist import WishlistItemCreate, WishlistItemUpdate
from app.services.slug import get_unique_slug


async def get_my_wishlists(db: AsyncSession, user_id: UUID) -> list[Wishlist]:
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.items))
        .where(Wishlist.user_id == user_id)
        .order_by(Wishlist.created_at.desc())
    )
    return list(result.scalars().all())


async def get_wishlist_by_id(db: AsyncSession, wishlist_id: UUID, user_id: UUID) -> Wishlist | None:
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.items).selectinload(WishlistItem.reservations), selectinload(Wishlist.items).selectinload(WishlistItem.contributions))
        .where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def get_wishlist_by_slug(db: AsyncSession, slug: str) -> Wishlist | None:
    result = await db.execute(
        select(Wishlist)
        .options(selectinload(Wishlist.items).selectinload(WishlistItem.reservations), selectinload(Wishlist.items).selectinload(WishlistItem.contributions))
        .where(Wishlist.slug == slug)
    )
    return result.scalar_one_or_none()


async def create_wishlist(db: AsyncSession, user_id: UUID, name: str, occasion: str) -> Wishlist:
    slug = await get_unique_slug(db)
    wishlist = Wishlist(user_id=user_id, name=name, occasion=occasion, slug=slug)
    db.add(wishlist)
    await db.flush()
    return wishlist


async def add_item(db: AsyncSession, wishlist_id: UUID, user_id: UUID, data: WishlistItemCreate) -> WishlistItem | None:
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id))
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        return None
    item = WishlistItem(wishlist_id=wishlist_id, **data.model_dump())
    db.add(item)
    await db.flush()
    # Eagerly load relationships needed by _owner_item() to avoid lazy-load in async context
    await db.refresh(item, attribute_names=["reservations", "contributions"])
    return item


async def update_item(db: AsyncSession, wishlist_id: UUID, item_id: UUID, user_id: UUID, data: WishlistItemUpdate) -> WishlistItem | None:
    result = await db.execute(
        select(WishlistItem).join(Wishlist).where(
            WishlistItem.id == item_id, Wishlist.id == wishlist_id, Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    await db.flush()
    await db.refresh(item, attribute_names=["reservations", "contributions"])
    return item


async def delete_wishlist(db: AsyncSession, wishlist_id: UUID, user_id: UUID) -> bool:
    result = await db.execute(
        select(Wishlist).where(Wishlist.id == wishlist_id, Wishlist.user_id == user_id)
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        return False
    await db.delete(wishlist)
    return True


async def delete_item(db: AsyncSession, wishlist_id: UUID, item_id: UUID, user_id: UUID) -> bool:
    result = await db.execute(
        select(WishlistItem).join(Wishlist).where(
            WishlistItem.id == item_id, Wishlist.id == wishlist_id, Wishlist.user_id == user_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    return True


async def get_reserver_key(email: str | None, anonymous_token: str | None) -> str:
    return email if email else (anonymous_token or "")


async def reserve_item(db: AsyncSession, slug: str, item_id: UUID, reserver_key: str, is_anonymous: bool) -> WishlistItem | None:
    result = await db.execute(
        select(WishlistItem).join(Wishlist).where(Wishlist.slug == slug, WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        return None
    existing = await db.execute(select(Reservation).where(Reservation.item_id == item_id))
    if existing.scalar_one_or_none():
        return None
    reservation = Reservation(item_id=item_id, reserver_key=reserver_key, is_anonymous=is_anonymous)
    db.add(reservation)
    await db.flush()
    return item


async def unreserve_item(db: AsyncSession, slug: str, item_id: UUID, reserver_key: str) -> bool:
    result = await db.execute(
        select(Reservation).join(WishlistItem).join(Wishlist).where(
            Wishlist.slug == slug, WishlistItem.id == item_id, Reservation.reserver_key == reserver_key
        )
    )
    reservation = result.scalar_one_or_none()
    if not reservation:
        return False
    await db.delete(reservation)
    return True


class ContributionExceedsTarget(Exception):
    """Raised when contribution amount would exceed target_amount."""
    pass


async def contribute_item(db: AsyncSession, slug: str, item_id: UUID, contributor_key: str, amount: Decimal, is_anonymous: bool) -> WishlistItem | None:
    result = await db.execute(
        select(WishlistItem)
        .options(selectinload(WishlistItem.contributions))
        .join(Wishlist)
        .where(Wishlist.slug == slug, WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item or amount <= 0:
        return None
    target = item.target_amount or item.price
    total = sum(c.amount for c in item.contributions)
    if total + amount > target:
        raise ContributionExceedsTarget()
    contribution = Contribution(item_id=item_id, contributor_key=contributor_key, amount=amount, is_anonymous=is_anonymous)
    db.add(contribution)
    await db.flush()
    return item
