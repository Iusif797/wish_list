from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user_optional
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.schemas.wishlist import WishlistItemPublic, ReserveRequest, ContributeRequest, UnreserveRequest
from app.services import wishlist as wishlist_service
from app.websocket.manager import manager

router = APIRouter(prefix="/wishlists/public", tags=["public"])


def _get_key(user: User | None, anonymous_token: str | None) -> str:
    if user:
        return user.email
    return anonymous_token or ""


def _public_item(item: WishlistItem, reserver_key: str, contributor_key: str) -> WishlistItemPublic:
    total = sum(c.amount for c in item.contributions)
    target = item.target_amount or item.price
    progress = float(total / target) if target and target > 0 else 0.0
    reserved = len(item.reservations) > 0
    reserved_by_me = any(r.reserver_key == reserver_key for r in item.reservations)
    contributed_by_me = sum(c.amount for c in item.contributions if c.contributor_key == contributor_key)
    return WishlistItemPublic(
        id=item.id,
        name=item.name,
        url=item.url,
        price=item.price,
        image_url=item.image_url,
        target_amount=item.target_amount,
        reserved=reserved,
        reserved_by_me=reserved_by_me,
        total_contributed=total,
        contributed_by_me=contributed_by_me,
        progress=min(progress, 1.0),
    )


@router.post("/{slug}/items/{item_id}/reserve")
async def reserve_item(slug: str, item_id: UUID, body: ReserveRequest, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    key = _get_key(user, body.anonymous_token)
    if not key:
        raise HTTPException(status_code=400, detail="anonymous_token or auth required")
    item = await wishlist_service.reserve_item(db, slug, item_id, key, user is None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found or already reserved")
    await manager.broadcast(f"wishlist:{slug}", {"type": "reservation", "itemId": str(item_id)})
    return {"ok": True}


@router.delete("/{slug}/items/{item_id}/reserve")
async def unreserve_item(slug: str, item_id: UUID, body: UnreserveRequest, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    key = _get_key(user, body.anonymous_token)
    if not key:
        raise HTTPException(status_code=400, detail="anonymous_token or auth required")
    ok = await wishlist_service.unreserve_item(db, slug, item_id, key)
    if not ok:
        raise HTTPException(status_code=404)
    await manager.broadcast(f"wishlist:{slug}", {"type": "unreserve", "itemId": str(item_id)})
    return {"ok": True}


@router.post("/{slug}/items/{item_id}/contribute")
async def contribute_item(slug: str, item_id: UUID, body: ContributeRequest, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    key = _get_key(user, body.anonymous_token)
    if not key:
        raise HTTPException(status_code=400, detail="anonymous_token or auth required")
    item = await wishlist_service.contribute_item(db, slug, item_id, key, body.amount, user is None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await manager.broadcast(f"wishlist:{slug}", {"type": "contribution", "itemId": str(item_id)})
    return {"ok": True}
