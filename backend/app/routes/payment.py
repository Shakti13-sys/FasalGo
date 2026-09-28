from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import OptionalCurrentUser
from app.db.session import get_db
from app.schemas.payment import PaymentResponse
from app.services.payment_service import payment_service

router = APIRouter(prefix="/payment", tags=["Payment"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/active", response_model=PaymentResponse)
def get_payment_info(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    return payment_service.get_payment_info(db, user=current_user)
