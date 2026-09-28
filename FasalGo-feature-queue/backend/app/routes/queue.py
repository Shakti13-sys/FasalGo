from fastapi import APIRouter, HTTPException

from app.services.queue_service import queue_service


router = APIRouter(
    prefix="/queue",
    tags=["Queue"]
)


@router.get("/{centre_id}")
def get_queue(centre_id: str):
    try:
        return queue_service.get_queue(centre_id)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.get("/token/{token_id}")
def get_token_queue(token_id: str):
    try:
        return queue_service.get_token_queue(token_id)
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e)
        )