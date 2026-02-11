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
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"ok": True}

app.include_router(auth.router, prefix="/api")
app.include_router(wishlists.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(meta.router, prefix="/api")
app.include_router(websocket.router)
