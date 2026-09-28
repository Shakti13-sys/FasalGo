from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.recommendation import (
    BestTimeSlot,
    CentreRecommendation,
    RerouteResponse,
)
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Procurement Intelligence"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/centres", response_model=List[CentreRecommendation])
def get_centre_recommendations(
    db: DatabaseSession,
    lat: float = Query(19.9975, description="Farmer Latitude"),
    lon: float = Query(73.7898, description="Farmer Longitude"),
):
    return recommendation_service.recommend_centres(farmer_lat=lat, farmer_lon=lon, db=db)


@router.get("/best-time", response_model=BestTimeSlot)
def get_best_time_to_visit(
    db: DatabaseSession,
    centre_id: str = Query("c1", description="Centre ID"),
):
    try:
        return recommendation_service.best_time(centre_id=centre_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/reroute/{token_id}", response_model=RerouteResponse)
def evaluate_reroute(token_id: str, db: DatabaseSession):
    try:
        return recommendation_service.evaluate_reroute_for_token(token_id=token_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
