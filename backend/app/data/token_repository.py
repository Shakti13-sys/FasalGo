from typing import Optional
from sqlalchemy.orm import Session

from app.core.constants import TokenStatus
from app.db.models import ProcurementCentre, Token, User
from app.db.session import SessionLocal
from app.schemas.token import TokenResponseModel


class TokenRepository:
    def generate_token(
        self,
        centre_id: str,
        date: str,
        time: str,
        crop: str = "Wheat",
        quantity: float = 85.0,
        user_id: Optional[int] = None,
        slot_id: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> TokenResponseModel:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
            centre_name = centre.name if centre else "Procurement Centre"

            # Compute next sequential token number for this centre
            latest_token = (
                db.query(Token)
                .filter(Token.centre_id == centre_id)
                .order_by(Token.token_number.desc())
                .first()
            )
            next_number = (latest_token.token_number + 1) if latest_token else 48

            token_id = f"tkn-{centre_id}-{next_number}"
            token = Token(
                id=token_id,
                token_number=next_number,
                token_code=f"#{next_number}",
                centre_id=centre_id,
                slot_id=slot_id,
                user_id=user_id,
                crop=crop,
                quantity=quantity,
                status=TokenStatus.IN_QUEUE,
                date=date,
                time=time,
                booked_at_eta_minutes=25.0,
            )
            db.add(token)
            db.commit()
            db.refresh(token)

            # Calculate estimated wait
            active_counters = max(centre.active_counters if centre else 3, 1)
            proc_time = centre.avg_processing_time_minutes if centre else 6.0
            from app.data.queue_repository import queue_repository
            serving = queue_repository.get_currently_serving(centre_id)
            farmers_ahead = max(0, next_number - serving)
            estimated_wait = max(5, int(round((farmers_ahead / active_counters) * proc_time)))

            return TokenResponseModel(
                id=token.id,
                number=token.token_number,
                centreId=token.centre_id,
                centreName=centre_name,
                date=token.date,
                time=token.time,
                crop=token.crop,
                quantity=token.quantity,
                status=token.status.value if hasattr(token.status, "value") else str(token.status),
                estimatedWait=estimated_wait,
            )
        finally:
            if close_on_exit:
                db.close()

    def get_token(self, token_id: str, db: Optional[Session] = None) -> Optional[TokenResponseModel]:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            token = (
                db.query(Token)
                .filter((Token.id == token_id) | (Token.token_code == token_id))
                .first()
            )
            if not token:
                # Return default token for fallback
                return TokenResponseModel(
                    id="t-init-47",
                    number=47,
                    centreId="c1",
                    centreName="Centre A — Nashik Mandi",
                    date="Today",
                    time="10:00 AM",
                    crop="Wheat",
                    quantity=85.0,
                    status="in-queue",
                    estimatedWait=25,
                )

            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == token.centre_id).first()
            centre_name = centre.name if centre else "Centre A — Nashik Mandi"
            active_counters = max(centre.active_counters if centre else 3, 1)
            proc_time = centre.avg_processing_time_minutes if centre else 6.0

            from app.data.queue_repository import queue_repository
            serving = queue_repository.get_currently_serving(token.centre_id)
            farmers_ahead = max(0, token.token_number - serving)
            estimated_wait = max(3, int(round((farmers_ahead / active_counters) * proc_time)))

            return TokenResponseModel(
                id=token.id,
                number=token.token_number,
                centreId=token.centre_id,
                centreName=centre_name,
                date=token.date,
                time=token.time,
                crop=token.crop,
                quantity=token.quantity,
                status=token.status.value if hasattr(token.status, "value") else str(token.status),
                estimatedWait=estimated_wait,
            )
        finally:
            if close_on_exit:
                db.close()


token_repository = TokenRepository()
