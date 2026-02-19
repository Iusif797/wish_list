import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


class OAuthGoogleCallback(BaseModel):
    code: str


def _get_redirect_uri() -> str:
    uri = os.environ.get("OAUTH_REDIRECT_URI", "http://localhost:3000/auth/callback").strip()
    return uri.rstrip("/")


@router.get("/oauth/google")
async def oauth_google_url():
    client_id = settings.google_client_id
    if not client_id:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Google OAuth not configured")
    redirect_uri = _get_redirect_uri()
    from urllib.parse import urlencode
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "openid email profile",
        "response_type": "code",
    }
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"}


@router.post("/oauth/google", response_model=TokenResponse)
async def oauth_google_callback(data: OAuthGoogleCallback, db: AsyncSession = Depends(get_db)):
    from authlib.integrations.httpx_client import AsyncOAuth2Client
    import logging
    logger = logging.getLogger(__name__)
    client_id = settings.google_client_id
    if not client_id:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Google OAuth not configured")
    redirect_uri = _get_redirect_uri()
    code = (data.code or "").strip()
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing authorization code")
    try:
        client = AsyncOAuth2Client(
            client_id=client_id,
            client_secret=settings.google_client_secret,
            redirect_uri=redirect_uri,
        )
        token = await client.fetch_token(
            "https://oauth2.googleapis.com/token",
            code=code,
            redirect_uri=redirect_uri,
        )
        resp = await client.get("https://www.googleapis.com/oauth2/v3/userinfo", token=token)
        user_info = resp.json()
        email = user_info.get("email")
        oauth_id = user_info.get("sub")
        name = user_info.get("name")
        if not email or not oauth_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google did not return email")
        result = await db.execute(select(User).where(User.oauth_id == oauth_id, User.oauth_provider == "google"))
        user = result.scalar_one_or_none()
        if not user:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if user:
                user.oauth_provider = "google"
                user.oauth_id = oauth_id
                await db.flush()
            else:
                user = User(email=email, oauth_provider="google", oauth_id=oauth_id, name=name)
                db.add(user)
                await db.flush()
        await db.refresh(user)
        access_token = create_access_token({"sub": str(user.id)})
        return TokenResponse(access_token=access_token, user=UserResponse.model_validate(user))
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("OAuth callback failed")
        msg = str(e) if str(e) else "OAuth failed"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg[:200])
