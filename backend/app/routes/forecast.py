from typing import Annotated, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recommendation import ForecastPoint
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/forecast", tags=["Forecast"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=List[ForecastPoint])
@router.get("/{centre_id}", response_model=List[ForecastPoint])
def get_centre_forecast(
    db: DatabaseSession,
    centre_id: str = "c1",
):
    return recommendation_service.get_forecast(centre_id=centre_id, db=db)
