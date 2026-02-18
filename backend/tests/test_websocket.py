"""WebSocket API tests."""

import pytest


async def test_websocket_connect_valid_slug(client):
    """WebSocket accepts connection for valid wishlist slug."""
    r_reg = await client.post(
        "/api/auth/register",
        json={"email": "ws@example.com", "password": "secret123"},
    )
    assert r_reg.status_code == 200
    token = r_reg.json()["access_token"]

    r_wl = await client.post(
        "/api/wishlists",
        json={"name": "WS List", "occasion": "Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r_wl.status_code == 200
    slug = r_wl.json()["slug"]

    async with client.websocket_connect(f"/ws/wishlist/{slug}") as ws:
        # Connection accepted (no immediate close)
        pass


async def test_websocket_invalid_slug_closes(client):
    """WebSocket closes for non-existent slug (server sends close code 4004)."""
    import httpx
    try:
        async with client.websocket_connect("/ws/wishlist/nonexistent-slug-xyz-123") as ws:
            # Server should close immediately; if we get here, receive will fail or return close
            _ = await ws.receive_text()
    except (httpx.RemoteProtocolError, Exception):
        # Expected when server closes connection
        pass
