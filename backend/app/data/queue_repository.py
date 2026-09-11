from typing import Optional

from app.data.centre_repository import centre_repository
from app.data.token_repository import token_repository
from app.schemas.queue import QueueResponse, TokenQueueResponse


class QueueRepository:

    def get_queue(self, centre_id: str) -> Optional[QueueResponse]:

        centre = centre_repository.get(centre_id)

        if centre is None:
            return None

        # Count tokens generated for this centre
        centre_tokens = [
            token
            for token in token_repository._tokens.values()
            if token.centre_id == centre_id
        ]

        # Dynamic queue length
        queue_length = centre.queue_length + len(centre_tokens)

        # Current serving token
        current_serving_token = f"TKN-{centre_id}-0001"

        # Queue status
        queue_status = "NORMAL"

        if queue_length >= 50:
            queue_status = "HIGH"
        elif queue_length >= 25:
            queue_status = "MODERATE"

        return QueueResponse(
            centre_id=centre_id,
            queue_length=queue_length,
            active_counters=centre.active_counters,
            current_serving_token=current_serving_token,
            queue_status=queue_status,
        )

    def get_token_queue(
        self,
        token_id: str
    ) -> Optional[TokenQueueResponse]:

        token = token_repository.get_token(token_id)

        if token is None:
            return None

        centre = centre_repository.get(token.centre_id)

        if centre is None:
            return None

        # Count tokens generated for this centre
        centre_tokens = [
            t
            for t in token_repository._tokens.values()
            if t.centre_id == token.centre_id
        ]

        queue_length = centre.queue_length + len(centre_tokens)

        # Tokens generated before this token
        farmers_ahead = sum(
            1
            for t in centre_tokens
            if t.token_number < token.token_number
        )

        queue_status = "NORMAL"

        if queue_length >= 50:
            queue_status = "HIGH"
        elif queue_length >= 25:
            queue_status = "MODERATE"

        return TokenQueueResponse(
            token_id=token.token_id,
            centre_id=token.centre_id,
            token_number=token.token_number,
            farmers_ahead=farmers_ahead,
            queue_length=queue_length,
            current_serving_token=f"TKN-{centre.centre_id}-0001",
            queue_status=queue_status,
            estimated_wait_minutes=token.estimated_wait_minutes,
        )


queue_repository = QueueRepository()