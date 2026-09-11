from app.data.queue_repository import queue_repository
from app.schemas.queue import QueueResponse, TokenQueueResponse


class QueueService:

    def get_queue(self, centre_id: str) -> QueueResponse:
        queue = queue_repository.get_queue(centre_id)

        if queue is None:
            raise ValueError("Centre not found")

        return queue

    def get_token_queue(self, token_id: str) -> TokenQueueResponse:
        queue = queue_repository.get_token_queue(token_id)

        if queue is None:
            raise ValueError("Token not found")

        return queue


queue_service = QueueService()