from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import CongestionLevel, OperationalStatus


class CentreResponse(BaseModel):
    id: str
    name: str
    code: str
    distance: float = 0.0  # in km (computed dynamically relative to farmer)
    lat: float
    lng: float
    queue: int = 0
    activeCounters: int
    totalCounters: int
    avgProcessingTime: float
    capacity: int
    congestion: str = "low"  # "low" | "medium" | "high"
    waitTime: int = 0  # in minutes
    processingSpeed: int
    address: str

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    totalFarmers: int
    activeTokens: int
    activeCentres: int
    farmersWaiting: int
    avgWaitingTime: int


class CounterUpdateRequest(BaseModel):
    active_counters: int
