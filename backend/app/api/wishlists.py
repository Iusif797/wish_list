from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.wishlist import Wishlist, WishlistItem, Reservation, Contribution
from app.schemas.wishlist import (
    WishlistCreate,
    WishlistResponse,
    WishlistPublicResponse,
    WishlistListItem,
    WishlistItemCreate,
    WishlistItemUpdate,
    WishlistItemPublic,
    WishlistItemOwner,
    ReserveRequest,
    ContributeRequest,
)
from app.services import wishlist as wishlist_service

router = APIRouter(prefix="/wishlists", tags=["wishlists"])


def _owner_item(item: WishlistItem) -> WishlistItemOwner:
    total = sum(c.amount for c in item.contributions)
    target = item.target_amount or item.price
    progress = float(total / target) if target and target > 0 else 0.0
    return WishlistItemOwner(
        id=item.id,
        name=item.name,
        url=item.url,
        price=item.price,
        image_url=item.image_url,
        target_amount=item.target_amount,
        reserved=len(item.reservations) > 0,
        total_contributed=total,
        progress=min(progress, 1.0),
    )


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


@router.get("/my", response_model=list[WishlistListItem])
async def my_wishlists(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    lists = await wishlist_service.get_my_wishlists(db, user.id)
    return [
        WishlistListItem(
            id=w.id,
            name=w.name,
            occasion=w.occasion,
            slug=w.slug,
            item_count=len(w.items),
        )
        for w in lists
    ]


@router.post("", response_model=WishlistResponse)
async def create_wishlist(data: WishlistCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wishlist = await wishlist_service.create_wishlist(db, user.id, data.name, data.occasion)
    await db.refresh(wishlist)
    return WishlistResponse(
        id=wishlist.id,
        name=wishlist.name,
        occasion=wishlist.occasion,
        slug=wishlist.slug,
        items=[],
    )


@router.get("/{wishlist_id}", response_model=WishlistResponse)
async def get_wishlist(wishlist_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wishlist = await wishlist_service.get_wishlist_by_id(db, wishlist_id, user.id)
    if not wishlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return WishlistResponse(
        id=wishlist.id,
        name=wishlist.name,
        occasion=wishlist.occasion,
        slug=wishlist.slug,
        items=[_owner_item(i) for i in wishlist.items],
    )


@router.delete("/{wishlist_id}")
async def delete_wishlist(wishlist_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    ok = await wishlist_service.delete_wishlist(db, wishlist_id, user.id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"ok": True}


@router.post("/{wishlist_id}/items", response_model=WishlistItemOwner)
async def add_item(wishlist_id: UUID, data: WishlistItemCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = await wishlist_service.add_item(db, wishlist_id, user.id, data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return _owner_item(item)


@router.patch("/{wishlist_id}/items/{item_id}", response_model=WishlistItemOwner)
async def update_item(wishlist_id: UUID, item_id: UUID, data: WishlistItemUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = await wishlist_service.update_item(db, wishlist_id, item_id, user.id, data)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return _owner_item(item)


@router.delete("/{wishlist_id}/items/{item_id}")
async def delete_item(wishlist_id: UUID, item_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    try:
        ok = await wishlist_service.delete_item(db, wishlist_id, item_id, user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return {"ok": True}


@router.post("/public/{slug}/items/{item_id}/contribute", response_model=WishlistItemPublic)
async def contribute_item(slug: str, item_id: UUID, data: ContributeRequest, anonymous_token: str | None = None, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    key = user.email if user else (anonymous_token or "")
    try:
        item = await wishlist_service.contribute_item(db, slug, item_id, key, data.amount, user is None)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return _public_item(item, key, key)
    except wishlist_service.ContributionExceedsTarget:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Contribution exceeds target amount")
    except wishlist_service.ItemAlreadyReserved:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item is already reserved")


@router.get("/public/{slug}", response_model=WishlistPublicResponse)
async def get_public_wishlist(slug: str, anonymous_token: str | None = None, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user_optional)):
    wishlist = await wishlist_service.get_wishlist_by_slug(db, slug)
    if not wishlist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    key = user.email if user else (anonymous_token or "")
    return WishlistPublicResponse(
        id=wishlist.id,
        name=wishlist.name,
        occasion=wishlist.occasion,
        slug=wishlist.slug,
        items=[_public_item(i, key, key) for i in wishlist.items],
    )
