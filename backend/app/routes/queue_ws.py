from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.data.queue_repository import queue_repository
from app.services.queue_manager import queue_manager

router = APIRouter(tags=["Queue WebSocket"])


@router.websocket("/ws/queue/{centre_id}")
async def queue_websocket(websocket: WebSocket, centre_id: str):
    await queue_manager.connect(websocket, centre_id)
    try:
        # Send current queue state immediately upon connection
        queue = queue_repository.get_queue(centre_id)
        await websocket.send_json(
            {
                "event": "INITIAL_QUEUE_STATE",
                "centre_id": centre_id,
                "currently_serving": queue.currently_serving,
                "queue_length": queue.queue_length,
                "active_counters": queue.active_counters,
                "avg_wait_minutes": queue.avg_wait_minutes,
                "congestion_level": queue.congestion_level,
                "tokens_in_queue": queue.tokens_in_queue,
            }
        )

        # Keep alive and handle any incoming client messages
        while True:
            data = await websocket.receive_text()
            # If client sends a ping or action
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        queue_manager.disconnect(websocket, centre_id)
    except Exception:
        queue_manager.disconnect(websocket, centre_id)
