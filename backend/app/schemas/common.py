from pydantic import BaseModel, ConfigDict
from app.core.constants import CongestionLevel, OperationalStatus


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class CentreSnapshot(BaseModel):
    centre_id: str
    name: str
    coordinates: Coordinates
    active_counters: int
    total_counters: int
    queue_length: int
    avg_processing_time_minutes: float
    capacity: int
    processing_speed: int = 30
    operational_status: OperationalStatus
    address: str = ""

    model_config = ConfigDict(from_attributes=True)
