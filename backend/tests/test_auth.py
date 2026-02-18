"""Auth API tests."""


async def test_me_with_valid_token(client):
    r_reg = await client.post(
        "/api/auth/register",
        json={"email": "me@example.com", "password": "secret123", "name": "Me"},
    )
    assert r_reg.status_code == 200
    token = r_reg.json()["access_token"]

    r = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@example.com"


async def test_me_without_token_returns_401(client):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


async def test_login_invalid_password_returns_401(client):
    await client.post(
        "/api/auth/register",
        json={"email": "auth@example.com", "password": "secret123"},
    )
    r = await client.post(
        "/api/auth/login",
        json={"email": "auth@example.com", "password": "wrong"},
    )
    assert r.status_code == 401


async def test_register_and_login(client):
    # Register
    r = await client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "secret123", "name": "Test"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"

    # Login
    r2 = await client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "secret123"},
    )
    assert r2.status_code == 200
    assert "access_token" in r2.json()


async def test_register_duplicate_email(client):
    await client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "password": "secret123"},
    )
    r = await client.post(
        "/api/auth/register",
        json={"email": "dup@example.com", "password": "other"},
    )
    assert r.status_code == 400
