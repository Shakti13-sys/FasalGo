from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.constants import CongestionLevel


class RecommendationFactors(BaseModel):
    distance_km: float
    predicted_wait_minutes: float
    eta_minutes: float
    prediction_confidence: float
    queue_length: int
    active_counters: int
    congestion_level: CongestionLevel
    congestion_index: float = Field(..., ge=0, le=1)


class CentreRecommendation(BaseModel):
    centre_id: str
    centre_name: str
    score: float = Field(..., ge=0, le=100)
    rank: int
    factors: RecommendationFactors
    reason: str


class RecommendationResponse(BaseModel):
    farmer_location: dict
    generated_at: str
    recommendations: List[CentreRecommendation]


class BestTimeSlot(BaseModel):
    recommended_time: str
    expected_wait_minutes: float
    congestion_level: CongestionLevel
    expected_queue: int
    reason: str


class BestTimeResponse(BaseModel):
    centre_id: str
    centre_name: str
    best_slots: List[BestTimeSlot]


class CongestionResponse(BaseModel):
    centre_id: str
    centre_name: str
    congestion_level: CongestionLevel
    congestion_index: float
    queue_length: int
    active_counters: int
    utilization_pct: float
    explanation: str


class ForecastPoint(BaseModel):
    time: str
    congestion: CongestionLevel
    expected_queue: int
    expected_wait_minutes: float


class ForecastResponse(BaseModel):
    centre_id: str
    centre_name: str
    horizon_hours: int
    forecast: List[ForecastPoint]


class RerouteResponse(BaseModel):
    token_id: str
    reroute_recommended: bool
    current_centre_id: str
    current_eta_minutes: Optional[float] = None
    alternative_centre_id: Optional[str] = None
    alternative_eta_minutes: Optional[float] = None
    improvement_minutes: Optional[float] = None
    improvement_pct: Optional[float] = None
    reason: str
