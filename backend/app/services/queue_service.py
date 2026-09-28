from typing import Optional
from sqlalchemy.orm import Session

from app.data.queue_repository import queue_repository
from app.db.models import ProcurementCentre
from app.schemas.queue import LiveQueueResponse, WaitTimePredictionResponse
from app.services.queue_manager import queue_manager


class QueueService:
    def get_queue(self, centre_id: str, db: Session) -> LiveQueueResponse:
        return queue_repository.get_queue(centre_id, db=db)

    def get_prediction(
        self, token_number: int, centre_id: str = "c1", db: Optional[Session] = None
    ) -> WaitTimePredictionResponse:
        return queue_repository.get_token_prediction(token_number, centre_id=centre_id, db=db)

    async def advance_queue(
        self, centre_id: str, increment: int = 1, db: Optional[Session] = None
    ) -> LiveQueueResponse:
        queue_repository.advance_queue(centre_id, increment=increment)
        queue = queue_repository.get_queue(centre_id, db=db)

        # Broadcast live advance event to all connected farmers
        await queue_manager.broadcast(
            centre_id,
            {
                "event": "QUEUE_ADVANCED",
                "centre_id": centre_id,
                "currently_serving": queue.currently_serving,
                "queue_length": queue.queue_length,
                "active_counters": queue.active_counters,
                "avg_wait_minutes": queue.avg_wait_minutes,
                "congestion_level": queue.congestion_level,
            },
        )
        return queue

    async def simulate_queue_spike(
        self, centre_id: str, new_queue_len: int = 45, db: Optional[Session] = None
    ) -> LiveQueueResponse:
        queue_repository.set_queue_override(centre_id, new_queue_len)
        queue = queue_repository.get_queue(centre_id, db=db)

        await queue_manager.broadcast(
            centre_id,
            {
                "event": "CONGESTION_ALERT",
                "centre_id": centre_id,
                "currently_serving": queue.currently_serving,
                "queue_length": queue.queue_length,
                "active_counters": queue.active_counters,
                "avg_wait_minutes": queue.avg_wait_minutes,
                "congestion_level": "high",
                "message": f"Congestion alert: Queue at {queue.centre_name} has increased to {queue.queue_length} farmers.",
            },
        )
        return queue


queue_service = QueueService()
