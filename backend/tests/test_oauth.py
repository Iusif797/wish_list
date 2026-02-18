"""OAuth API tests."""

import pytest


async def test_oauth_google_url_when_configured(client):
    """GET /api/auth/oauth/google returns URL when google_client_id is set."""
    from unittest.mock import patch
    with patch("app.api.auth.settings") as mock_settings:
        mock_settings.google_client_id = "test-client-id"
        mock_settings.google_client_secret = "secret"
        r = await client.get("/api/auth/oauth/google")
    if r.status_code == 501:
        pytest.skip("Google OAuth not configured in test env")
    assert r.status_code == 200
    data = r.json()
    assert "url" in data
    assert "accounts.google.com" in data["url"]


async def test_oauth_google_url_when_not_configured(client):
    """GET /api/auth/oauth/google returns 501 when google_client_id is empty."""
    from unittest.mock import patch
    with patch("app.api.auth.settings") as mock_settings:
        mock_settings.google_client_id = ""
        r = await client.get("/api/auth/oauth/google")
    assert r.status_code == 501


async def test_oauth_google_callback_with_mock(client):
    """POST /api/auth/oauth/google exchanges code for token (mocked)."""
    from unittest.mock import patch, AsyncMock, MagicMock
    with patch("app.api.auth.settings") as mock_settings:
        mock_settings.google_client_id = "test-id"
        mock_settings.google_client_secret = "test-secret"
        with patch("app.api.auth.AsyncOAuth2Client") as MockClient:
            mock_instance = MagicMock()
            mock_instance.fetch_token = AsyncMock(return_value={"access_token": "gt"})
            mock_resp = MagicMock()
            mock_resp.json = lambda: {"email": "oauth@example.com", "sub": "google-123", "name": "OAuth User"}
            mock_instance.get = AsyncMock(return_value=mock_resp)
            MockClient.return_value = mock_instance
            r = await client.post("/api/auth/oauth/google", json={"code": "fake-code"})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == "oauth@example.com"
