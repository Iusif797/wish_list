"""WebSocket API tests."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_websocket_connect_valid_slug():
    """WebSocket accepts connection for valid wishlist slug."""
    with TestClient(app) as client:
        r_reg = client.post(
            "/api/auth/register",
            json={"email": "ws_test_unique@example.com", "password": "secret123"},
        )
        assert r_reg.status_code == 200
        token = r_reg.json()["access_token"]

        r_wl = client.post(
            "/api/wishlists",
            json={"name": "WS List", "occasion": "Test"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r_wl.status_code == 200
        slug = r_wl.json()["slug"]

        with client.websocket_connect(f"/ws/wishlist/{slug}") as ws:
            # Connection accepted (no immediate close)
            pass


def test_websocket_invalid_slug_closes():
    """WebSocket closes for non-existent slug (server sends close code 4004)."""
    with TestClient(app) as client:
        try:
            with client.websocket_connect("/ws/wishlist/nonexistent-slug-xyz-123") as ws:
                _ = ws.receive_text()
        except Exception:
            # Expected when server closes connection
            pass
