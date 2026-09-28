from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recommendation import CongestionResponse
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/congestion", tags=["Congestion"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/{centre_id}", response_model=CongestionResponse)
def get_centre_congestion(centre_id: str, db: DatabaseSession):
    try:
        return recommendation_service.get_congestion(centre_id=centre_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
