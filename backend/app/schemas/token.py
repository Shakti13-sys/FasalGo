from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TokenGenerate(BaseModel):
    centre_id: str
    slot_id: str


class TokenResponse(BaseModel):
    token_id: str
    centre_id: str
    slot_id: str
    token_number: int
    status: str
    booked_at: datetime
    estimated_wait_minutes: Optional[float] = None
    