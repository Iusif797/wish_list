from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services import wishlist as wishlist_service
from app.websocket.manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/wishlist/{slug}")
async def wishlist_websocket(websocket: WebSocket, slug: str, db: AsyncSession = Depends(get_db)):
    wishlist = await wishlist_service.get_wishlist_by_slug(db, slug)
    if not wishlist:
        await websocket.close(code=4004)
        return
    channel = f"wishlist:{slug}"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)
