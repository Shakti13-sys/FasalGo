from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SlotBase(BaseModel):
    centre_id: str
    slot_time: datetime
    capacity: int = Field(gt=0)
    booked_count: int = Field(default=0, ge=0)


class SlotCreate(SlotBase):
    pass


class SlotResponse(SlotBase):
    slot_id: str
    available_capacity: int
    is_available: bool


class SlotBooking(BaseModel):
    centre_id: str
    slot_id: str


class SlotCancel(BaseModel):
    slot_id: str