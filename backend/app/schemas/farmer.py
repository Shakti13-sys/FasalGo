from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import UserRole


class FarmerProfileResponse(BaseModel):
    id: int
    user_id: int
    crop: str | None = None
    quantity: float | None = None
    state: str | None = None
    district: str | None = None
    location: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerProfileUpdate(BaseModel):
    crop: str | None = Field(default=None, max_length=120)
    quantity: float | None = Field(default=None, ge=0)
    state: str | None = Field(default=None, max_length=120)
    district: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=255)


class FarmerDetail(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: FarmerProfileResponse | None = Field(
        default=None, validation_alias="farmer_profile", serialization_alias="profile"
    )

    model_config = ConfigDict(from_attributes=True)