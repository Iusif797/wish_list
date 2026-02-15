import asyncio

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.wishlist import Reservation


async def register_and_get_headers(client: AsyncClient, email: str, password: str) -> dict:
    res = await client.post("/api/auth/register", json={"email": email, "password": password, "name": "Test"})
    assert res.status_code == 200, f"Register failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def create_wishlist_with_item(client: AsyncClient, headers: dict) -> tuple[str, str, str]:
    res = await client.post("/api/wishlists", json={"name": "Test Wishlist", "occasion": "Birthday"}, headers=headers)
    assert res.status_code == 200, f"Create wishlist failed: {res.text}"
    wishlist_id = res.json()["id"]
    slug = res.json()["slug"]

    res = await client.post(
        f"/api/wishlists/{wishlist_id}/items",
        json={"name": "iPhone 16", "url": "https://apple.com/iphone", "price": 999},
        headers=headers,
    )
    assert res.status_code == 200, f"Create item failed: {res.text}"
    item_id = res.json()["id"]

    return wishlist_id, item_id, slug


@pytest.mark.asyncio
async def test_create_wishlist_and_item(client: AsyncClient):
    headers = await register_and_get_headers(client, "creator@test.com", "strongpass123")
    wishlist_id, item_id, slug = await create_wishlist_with_item(client, headers)

    assert wishlist_id is not None
    assert item_id is not None
    assert slug is not None


@pytest.mark.asyncio
async def test_reservation_unique_constraint(client: AsyncClient, db_session: AsyncSession):
    headers = await register_and_get_headers(client, "racer@test.com", "strongpass123")
    wishlist_id, item_id, slug = await create_wishlist_with_item(client, headers)

    r1 = await client.post(
        f"/api/wishlists/public/{slug}/items/{item_id}/reserve",
        json={"anonymous_token": "guest_a"},
    )
    assert r1.status_code == 200

    r2 = await client.post(
        f"/api/wishlists/public/{slug}/items/{item_id}/reserve",
        json={"anonymous_token": "guest_b"},
    )
    assert r2.status_code == 404, f"Second reservation must fail, got {r2.status_code}: {r2.text}"

    from uuid import UUID as _UUID
    result = await db_session.execute(select(Reservation).where(Reservation.item_id == _UUID(item_id)))
    reservations = result.scalars().all()
    assert len(reservations) == 1


@pytest.mark.asyncio
async def test_delete_item_with_contributions_blocked(client: AsyncClient):
    headers = await register_and_get_headers(client, "deleter@test.com", "strongpass123")
    wishlist_id, item_id, slug = await create_wishlist_with_item(client, headers)

    res = await client.post(
        f"/api/wishlists/public/{slug}/items/{item_id}/contribute",
        json={"amount": 50, "anonymous_token": "donor_x"},
    )
    assert res.status_code == 200, f"Contribute failed: {res.text}"

    res = await client.delete(f"/api/wishlists/{wishlist_id}/items/{item_id}", headers=headers)
    assert res.status_code == 400
    assert "contributions" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_delete_item_without_contributions_succeeds(client: AsyncClient):
    headers = await register_and_get_headers(client, "cleaner@test.com", "strongpass123")
    wishlist_id, item_id, slug = await create_wishlist_with_item(client, headers)

    res = await client.delete(f"/api/wishlists/{wishlist_id}/items/{item_id}", headers=headers)
    assert res.status_code == 200
    assert res.json()["ok"] is True
