from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.queue_manager import queue_manager
from app.services.queue_service import queue_service


router = APIRouter(
    tags=["Queue WebSocket"]
)


@router.websocket("/ws/queue/{centre_id}")
async def queue_websocket(
    websocket: WebSocket,
    centre_id: str
):
    try:
        # Connect farmer to the centre's live queue
        await queue_manager.connect(
            websocket,
            centre_id
        )

        # Send current queue immediately
        queue = queue_service.get_queue(centre_id)

        await websocket.send_json(
            queue.model_dump()
        )

        # Keep connection alive
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        queue_manager.disconnect(
            websocket,
            centre_id
        )
        