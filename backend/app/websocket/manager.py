import json
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._channels: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, websocket: WebSocket, channel: str) -> None:
        await websocket.accept()
        self._channels[channel].add(websocket)

    def disconnect(self, websocket: WebSocket, channel: str) -> None:
        self._channels[channel].discard(websocket)
        if not self._channels[channel]:
            del self._channels[channel]

    async def broadcast(self, channel: str, message: dict) -> None:
        payload = json.dumps(message, default=str)
        for ws in list(self._channels.get(channel, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                self._channels[channel].discard(ws)


manager = ConnectionManager()
