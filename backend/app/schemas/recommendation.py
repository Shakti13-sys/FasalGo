from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import CongestionLevel
from app.schemas.centre import CentreResponse


class BestTimeSlot(BaseModel):
    start: str
    end: str
    expectedWaitMin: int
    expectedWaitMax: int
    confidence: int


class RecommendationFactors(BaseModel):
    distance_km: float
    predicted_wait_minutes: float
    eta_minutes: float
    prediction_confidence: float
    queue_length: int
    active_counters: int
    congestion_level: CongestionLevel
    congestion_index: float


class CentreRecommendation(BaseModel):
    centre: CentreResponse
    rank: int
    score: float
    reasons: List[str]
    isTop: bool = False


class ForecastPoint(BaseModel):
    hour: str  # e.g. "12:00 PM"
    level: str  # "low" | "medium" | "high"
    value: int  # Congestion percentage e.g. 45
    predictedFarmers: int


class CongestionResponse(BaseModel):
    centre_id: str
    centre_name: str
    congestion_level: str
    congestion_index: float
    queue_length: int
    active_counters: int
    utilization_pct: float
    explanation: str


class RerouteResponse(BaseModel):
    token_id: str
    reroute_recommended: bool
    current_centre_id: str
    current_centre_name: str = ""
    current_eta_minutes: float
    alternative_centre_id: Optional[str] = None
    alternative_centre_name: Optional[str] = None
    alternative_eta_minutes: Optional[float] = None
    improvement_minutes: Optional[float] = None
    improvement_pct: Optional[float] = None
    reason: str
