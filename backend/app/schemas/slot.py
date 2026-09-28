from typing import Optional
from pydantic import BaseModel, ConfigDict


class SlotResponse(BaseModel):
    id: str
    centre_id: str
    date: str
    time: str
    capacity: int
    booked_count: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)


class SlotBookingRequest(BaseModel):
    centre_id: str
    date: str
    time: str
    crop: Optional[str] = "Wheat"
    quantity: Optional[float] = 85.0
