from app.data.token_repository import token_repository
from app.services.slot_service import slot_service
from app.services.queue_manager import queue_manager
from app.services.queue_service import queue_service
from app.schemas.token import TokenResponse


class TokenService:

    async def generate_token(
        self,
        centre_id: str,
        slot_id: str
    ) -> TokenResponse:

        # Check that the slot exists
        slot = slot_service.book_slot(slot_id)

        # Make sure the slot belongs to this centre
        if slot.centre_id != centre_id:
            raise ValueError("Slot does not belong to this centre")

        # Generate sequential token
        token = token_repository.generate_token(
            centre_id=centre_id,
            slot_id=slot_id
        )

        # Get updated queue information
        queue = queue_service.get_queue(centre_id)

        # Send live queue update to connected farmers
        await queue_manager.broadcast(
            centre_id,
            {
                "event": "QUEUE_UPDATED",
                "token_id": token.token_id,
                "token_number": token.token_number,
                "centre_id": token.centre_id,
                "status": token.status,
                "queue_length": queue.queue_length,
                "active_counters": queue.active_counters,
                "current_serving_token": queue.current_serving_token,
                "queue_status": queue.queue_status,
            }
        )

        return token

    def get_token(self, token_id: str) -> TokenResponse:

        token = token_repository.get_token(token_id)

        if token is None:
            raise ValueError("Token not found")

        return token


token_service = TokenService()