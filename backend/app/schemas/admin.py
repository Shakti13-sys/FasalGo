from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.db.models import UserRole
from app.schemas.farmer import FarmerProfileResponse


class AdminProfile(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminFarmerDetail(BaseModel):
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


class AdminFarmerList(BaseModel):
    farmers: list[AdminFarmerDetail]
    total: int