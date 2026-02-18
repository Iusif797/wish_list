from decimal import Decimal
from pydantic import BaseModel, HttpUrl
from uuid import UUID


class WishlistItemBase(BaseModel):
    name: str
    url: str
    price: Decimal = Decimal("0")
    image_url: str | None = None
    target_amount: Decimal | None = None


class WishlistItemCreate(WishlistItemBase):
    pass


class WishlistItemUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    price: Decimal | None = None
    image_url: str | None = None
    target_amount: Decimal | None = None


class WishlistItemPublic(BaseModel):
    id: UUID
    name: str
    url: str
    price: Decimal
    image_url: str | None
    target_amount: Decimal | None
    reserved: bool
    reserved_by_me: bool
    total_contributed: Decimal
    contributed_by_me: Decimal
    progress: float

    class Config:
        from_attributes = True


class WishlistItemOwner(BaseModel):
    id: UUID
    name: str
    url: str
    price: Decimal
    image_url: str | None
    target_amount: Decimal | None
    reserved: bool
    total_contributed: Decimal
    progress: float

    class Config:
        from_attributes = True


class WishlistBase(BaseModel):
    name: str
    occasion: str


class WishlistCreate(WishlistBase):
    pass


class WishlistResponse(BaseModel):
    id: UUID
    name: str
    occasion: str
    slug: str
    items: list[WishlistItemOwner]

    class Config:
        from_attributes = True


class WishlistPublicResponse(BaseModel):
    id: UUID
    name: str
    occasion: str
    slug: str
    items: list[WishlistItemPublic]

    class Config:
        from_attributes = True


class WishlistListItem(BaseModel):
    id: UUID
    name: str
    occasion: str
    slug: str
    item_count: int = 0

    class Config:
        from_attributes = True


class ReserveRequest(BaseModel):
    anonymous_token: str | None = None


class ContributeRequest(BaseModel):
    amount: Decimal
    anonymous_token: str | None = None


class UnreserveRequest(BaseModel):
    anonymous_token: str | None = None
