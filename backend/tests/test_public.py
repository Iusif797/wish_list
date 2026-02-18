"""Public wishlist API tests (reserve, contribute, race condition)."""


async def test_reserve_twice_second_returns_404(client):
    # Create user and wishlist with one item
    r_reg = await client.post(
        "/api/auth/register",
        json={"email": "owner@example.com", "password": "secret123", "name": "Owner"},
    )
    assert r_reg.status_code == 200
    token = r_reg.json()["access_token"]

    r_wl = await client.post(
        "/api/wishlists",
        json={"name": "My List", "occasion": "Birthday"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_wl.status_code == 200
    wishlist_id = r_wl.json()["id"]

    r_item = await client.post(
        f"/api/wishlists/{wishlist_id}/items",
        json={"name": "Gift", "url": "https://example.com", "price": 100},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_item.status_code == 200
    item_id = r_item.json()["id"]
    slug = r_wl.json()["slug"]

    # First reserve succeeds
    r1 = await client.post(
        f"/api/wishlists/public/{slug}/items/{item_id}/reserve",
        json={"anonymous_token": "anon-1"},
    )
    assert r1.status_code == 200

    # Second reserve must return 404 (already reserved)
    r2 = await client.post(
        f"/api/wishlists/public/{slug}/items/{item_id}/reserve",
        json={"anonymous_token": "anon-2"},
    )
    assert r2.status_code == 404
