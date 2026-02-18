"""Wishlists API tests."""


async def test_delete_wishlist(client):
    """DELETE /api/wishlists/{id} removes wishlist and returns 200."""
    r_reg = await client.post(
        "/api/auth/register",
        json={"email": "del@example.com", "password": "secret123"},
    )
    assert r_reg.status_code == 200
    token = r_reg.json()["access_token"]

    r_wl = await client.post(
        "/api/wishlists",
        json={"name": "To Delete", "occasion": "Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_wl.status_code == 200
    wishlist_id = r_wl.json()["id"]

    r_del = await client.delete(
        f"/api/wishlists/{wishlist_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_del.status_code == 200

    r_list = await client.get(
        "/api/wishlists/my",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_list.status_code == 200
    ids = [w["id"] for w in r_list.json()]
    assert wishlist_id not in ids
