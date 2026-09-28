from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import OptionalCurrentUser
from app.data.queue_repository import queue_repository
from app.db.models import Payment, Procurement, Token
from app.db.session import get_db
from app.intelligence.voice_nlp import process_farmer_voice_query
from app.schemas.voice import VoiceQueryRequest, VoiceQueryResponse

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/query", response_model=VoiceQueryResponse)
def handle_voice_query(
    request: VoiceQueryRequest,
    db: DatabaseSession,
    current_user: OptionalCurrentUser = None,
):
    # Fetch live farmer context
    token_num = 47
    serving = queue_repository.get_currently_serving("c1")
    estimated_wait = 18
    payment_amt = 42500.0
    payment_stat = "Completed"
    proc_stage = "Quality Verification"

    if current_user:
        token = db.query(Token).filter(Token.user_id == current_user.id).order_by(Token.id.desc()).first()
        if token:
            token_num = token.token_number
            serving = queue_repository.get_currently_serving(token.centre_id)
            farmers_ahead = max(0, token.token_number - serving)
            estimated_wait = max(3, farmers_ahead * 2)

        payment = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.id.desc()).first()
        if payment:
            payment_amt = payment.amount
            payment_stat = payment.status.value if hasattr(payment.status, "value") else str(payment.status)

        proc = db.query(Procurement).filter(Procurement.user_id == current_user.id).order_by(Procurement.id.desc()).first()
        if proc:
            proc_stage = proc.status.value if hasattr(proc.status, "value") else str(proc.status)

    return process_farmer_voice_query(
        query=request.query,
        token_number=token_num,
        currently_serving=serving,
        estimated_wait=estimated_wait,
        best_centre_name="Centre A — Nashik Mandi",
        payment_amount=payment_amt,
        payment_status=payment_stat,
        procurement_stage=proc_stage,
    )
