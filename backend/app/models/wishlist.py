import uuid
from decimal import Decimal
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Numeric, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.core.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    occasion: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="wishlists")
    items: Mapped[list["WishlistItem"]] = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    wishlist_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0"))
    image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    target_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    wishlist: Mapped["Wishlist"] = relationship("Wishlist", back_populates="items")
    reservations: Mapped[list["Reservation"]] = relationship("Reservation", back_populates="item", cascade="all, delete-orphan")
    contributions: Mapped[list["Contribution"]] = relationship("Contribution", back_populates="item", cascade="all, delete-orphan")


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (UniqueConstraint("item_id", name="uq_reservations_item_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("wishlist_items.id", ondelete="CASCADE"), nullable=False)
    reserver_key: Mapped[str] = mapped_column(String(255), nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    item: Mapped["WishlistItem"] = relationship("WishlistItem", back_populates="reservations")
    
    __table_args__ = (UniqueConstraint('item_id', name='uq_reservation_item_id'),)


class Contribution(Base):
    __tablename__ = "contributions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("wishlist_items.id", ondelete="CASCADE"), nullable=False)
    contributor_key: Mapped[str] = mapped_column(String(255), nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    item: Mapped["WishlistItem"] = relationship("WishlistItem", back_populates="contributions")
