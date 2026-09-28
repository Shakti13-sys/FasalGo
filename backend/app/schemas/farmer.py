from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.auth import UserResponse


class FarmerProfileUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    crop: Optional[str] = None
    expected_quantity: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FarmerProfileResponse(BaseModel):
    id: str
    name: str
    mobile: str
    location: str
    state: str
    district: str
    crop: str
    expectedQuantity: float
    avatar: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class NotificationItem(BaseModel):
    id: str
    type: str  # 'turn' | 'queue' | 'procurement' | 'payment' | 'system'
    title: str
    message: str
    timestamp: str
    read: bool

    model_config = ConfigDict(from_attributes=True)
