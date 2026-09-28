from typing import Dict, List
from fastapi import WebSocket


class QueueConnectionManager:
    def __init__(self):
        # Maps centre_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, centre_id: str):
        await websocket.accept()
        if centre_id not in self.active_connections:
            self.active_connections[centre_id] = []
        self.active_connections[centre_id].append(websocket)

    def disconnect(self, websocket: WebSocket, centre_id: str):
        if centre_id in self.active_connections:
            if websocket in self.active_connections[centre_id]:
                self.active_connections[centre_id].remove(websocket)

    async def broadcast(self, centre_id: str, message: dict):
        connections = self.active_connections.get(centre_id, [])
        disconnected = []
        for websocket in connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
        for ws in disconnected:
            self.disconnect(ws, centre_id)


queue_manager = QueueConnectionManager()
