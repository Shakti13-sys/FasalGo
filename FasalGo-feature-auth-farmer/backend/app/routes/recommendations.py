from datetime import datetime
from fastapi import APIRouter, HTTPException, Query

from app.services.recommendation_service import recommendation_service
from app.schemas.recommendation import (
    RecommendationResponse, BestTimeResponse,
    CongestionResponse, ForecastResponse, RerouteResponse,
)

router = APIRouter(tags=["Procurement Intelligence"])


@router.get("/recommendations/centres", response_model=RecommendationResponse)
def get_centre_recommendations(
    lat: float = Query(..., description="Farmer's current latitude"),
    lon: float = Query(..., description="Farmer's current longitude"),
):
    try:
        recs = recommendation_service.recommend_centres(lat, lon)
        return RecommendationResponse(
            farmer_location={"latitude": lat, "longitude": lon},
            generated_at=datetime.now().isoformat(),
            recommendations=recs,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/recommendations/best-time", response_model=BestTimeResponse)
def get_best_time(
    centre_id: str = Query(..., description="Target procurement centre ID"),
):
    try:
        return recommendation_service.best_time(centre_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/congestion/{centre_id}", response_model=CongestionResponse)
def get_congestion(centre_id: str):
    try:
        return recommendation_service.get_congestion(centre_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/forecast/{centre_id}", response_model=ForecastResponse)
def get_forecast(centre_id: str):
    try:
        return recommendation_service.get_forecast(centre_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/recommendations/reroute/{token_id}", response_model=RerouteResponse)
def get_reroute_recommendation(token_id: str):
    try:
        return recommendation_service.evaluate_reroute_for_token(token_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
