from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/wishlist"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7
    google_client_id: str = ""
    google_client_secret: str = ""
    cors_origins: str = Field(default="http://localhost:3000,http://127.0.0.1:3000", description="Comma-separated CORS origins")
    cors_allow_all: bool = Field(default=False, description="Set to true to allow all origins (for debugging)")
    redis_url: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
