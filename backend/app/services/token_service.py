from typing import Optional
from sqlalchemy.orm import Session

from app.data.queue_repository import queue_repository
from app.data.token_repository import token_repository
from app.db.models import Token, User
from app.schemas.token import TokenResponseModel
from app.services.queue_manager import queue_manager
from app.services.slot_service import slot_service


class TokenService:
    async def generate_token(
        self,
        db: Session,
        centre_id: str,
        date: str,
        time: str,
        crop: str = "Wheat",
        quantity: float = 85.0,
        user: Optional[User] = None,
        slot_id: Optional[str] = None,
    ) -> TokenResponseModel:
        # Book slot if slot_id provided
        if slot_id:
            try:
                slot_service.book_slot(slot_id, db=db)
            except Exception:
                pass

        user_id = user.id if user else None
        token = token_repository.generate_token(
            centre_id=centre_id,
            date=date,
            time=time,
            crop=crop,
            quantity=quantity,
            user_id=user_id,
            slot_id=slot_id,
            db=db,
        )

        # Get updated queue state
        queue = queue_repository.get_queue(centre_id, db=db)

        # Broadcast live queue update to all WebSocket listeners for this centre
        await queue_manager.broadcast(
            centre_id,
            {
                "event": "QUEUE_UPDATED",
                "token_id": token.id,
                "token_number": token.number,
                "centre_id": token.centreId,
                "status": token.status,
                "currently_serving": queue.currently_serving,
                "queue_length": queue.queue_length,
                "active_counters": queue.active_counters,
                "avg_wait_minutes": queue.avg_wait_minutes,
                "congestion_level": queue.congestion_level,
            },
        )

        # Send SMS alert if user has phone number
        try:
            phone = getattr(user, "phone", None)
            if phone:
                from app.integrations.sms_service import send_sms_alert
                msg = f"FasalGo: Token #{token.number} book ho gaya hai. Date: {date}, Slot: {time}. Centre: {centre_id}."
                send_sms_alert(phone, msg)
        except Exception:
            pass

        return token

    def get_token(self, token_id: str, db: Session) -> TokenResponseModel:
        token = token_repository.get_token(token_id, db=db)
        if not token:
            raise ValueError("Token not found")
        return token

    def get_active_token_for_user(self, user: User, db: Session) -> Optional[TokenResponseModel]:
        latest_token = (
            db.query(Token)
            .filter(Token.user_id == user.id)
            .order_by(Token.id.desc())
            .first()
        )
        if not latest_token:
            return token_repository.get_token("t-init-47", db=db)
        return token_repository.get_token(latest_token.id, db=db)


token_service = TokenService()
