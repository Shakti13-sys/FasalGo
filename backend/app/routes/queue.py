from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.queue import LiveQueueResponse, QueueAdvanceRequest, WaitTimePredictionResponse
from app.services.queue_service import queue_service

router = APIRouter(prefix="/queue", tags=["Queue"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/{centre_id}", response_model=LiveQueueResponse)
def get_queue(centre_id: str, db: DatabaseSession):
    try:
        return queue_service.get_queue(centre_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/token/{token_id}", response_model=WaitTimePredictionResponse)
def get_token_queue(
    token_id: str,
    db: DatabaseSession,
    centre_id: str = Query("c1", description="Centre ID"),
):
    try:
        token_num = int(token_id.replace("tkn-", "").replace("t-init-", "").split("-")[-1])
    except Exception:
        token_num = 47
    return queue_service.get_prediction(token_num, centre_id=centre_id, db=db)


@router.post("/{centre_id}/advance", response_model=LiveQueueResponse)
async def advance_queue(
    centre_id: str,
    request: QueueAdvanceRequest,
    db: DatabaseSession,
):
    return await queue_service.advance_queue(centre_id, increment=request.increment_by, db=db)


@router.post("/{centre_id}/spike", response_model=LiveQueueResponse)
async def simulate_spike(
    centre_id: str,
    db: DatabaseSession,
    new_queue_length: int = Query(48, description="Simulated queue length"),
):
    return await queue_service.simulate_queue_spike(centre_id, new_queue_len=new_queue_length, db=db)
