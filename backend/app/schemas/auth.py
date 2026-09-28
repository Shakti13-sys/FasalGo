from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import UserRole


class RegistrationRequest(BaseModel):
    name: str
    mobile: str
    password: str
    location: Optional[str] = ""
    state: Optional[str] = ""
    district: Optional[str] = ""
    crop: Optional[str] = "Wheat"
    expected_quantity: Optional[float] = 85.0
    email: Optional[str] = None


class LoginRequest(BaseModel):
    mobile: Optional[str] = None
    identifier: Optional[str] = None
    email: Optional[str] = None
    password: str
    role: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    name: str
    mobile: str
    email: Optional[str] = None
    role: UserRole
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


TokenResponse.model_rebuild()
