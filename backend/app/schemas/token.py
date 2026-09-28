from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import TokenStatus


class TokenGenerateRequest(BaseModel):
    centre_id: str
    centre_name: Optional[str] = None
    date: str
    time: str
    crop: Optional[str] = "Wheat"
    quantity: Optional[float] = 85.0
    slot_id: Optional[str] = None


class TokenResponseModel(BaseModel):
    id: str
    number: int
    centreId: str
    centreName: str
    date: str
    time: str
    crop: str
    quantity: float
    status: str
    estimatedWait: int

    model_config = ConfigDict(from_attributes=True)
