from pydantic import BaseModel, Field
from app.core.constants import CongestionLevel, OperationalStatus


class Coordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


class CentreSnapshot(BaseModel):
    """Point-in-time operational state of a procurement centre."""
    centre_id: str
    name: str
    coordinates: Coordinates
    queue_length: int = Field(..., ge=0)
    active_counters: int = Field(..., ge=0)
    total_counters: int = Field(..., ge=0)
    capacity: int = Field(..., ge=1, description="Max farmers the centre can hold/serve in a day")
    avg_processing_time_minutes: float = Field(..., gt=0)
    operational_status: OperationalStatus
