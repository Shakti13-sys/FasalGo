from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import CongestionLevel


class WaitTimePredictionResponse(BaseModel):
    token: int
    currentlyServing: int
    farmersAhead: int
    estimatedWait: int  # minutes
    estimatedTurn: str  # e.g. "11:45 AM"
    confidence: int  # percentage (e.g. 89)
    status: str  # 'on-track' | 'delayed' | 'ahead'


class LiveQueueResponse(BaseModel):
    centre_id: str
    centre_name: str
    currently_serving: int
    queue_length: int
    active_counters: int
    total_counters: int
    avg_wait_minutes: int
    congestion_level: str
    tokens_in_queue: List[int] = []

    model_config = ConfigDict(from_attributes=True)


class QueueAdvanceRequest(BaseModel):
    increment_by: int = 1
