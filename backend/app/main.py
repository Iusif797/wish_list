from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, wishlists, public, meta, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    pass


app = FastAPI(title="Wishlist API", lifespan=lifespan)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
allow_all = getattr(settings, "cors_allow_all", False) or "*" in origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def root():
    return {"ok": True, "service": "wishlist-api"}


@app.get("/api/health")
def health():
    return {"ok": True}

app.include_router(auth.router, prefix="/api")
app.include_router(wishlists.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(meta.router, prefix="/api")
app.include_router(websocket.router)
