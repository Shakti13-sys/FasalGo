from typing import Tuple
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models import FarmerProfile, User
from app.schemas.auth import LoginRequest, RegistrationRequest, TokenResponse, UserResponse
from app.schemas.farmer import FarmerProfileResponse


class AuthService:
    def register_farmer(self, db: Session, request: RegistrationRequest) -> TokenResponse:
        existing = db.query(User).filter(User.mobile == request.mobile).first()
        if existing:
            raise ValueError("An account with this mobile number already exists.")

        user = User(
            name=request.name,
            mobile=request.mobile,
            email=request.email,
            password_hash=get_password_hash(request.password),
            role=UserRole.FARMER,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = FarmerProfile(
            user_id=user.id,
            crop=request.crop or "Wheat",
            quantity=request.expected_quantity or 85.0,
            state=request.state or "Maharashtra",
            district=request.district or "Nashik",
            location=request.location or "Panchavati",
            latitude=19.9975,
            longitude=73.7898,
        )
        db.add(profile)
        db.commit()

        token = create_access_token({"sub": str(user.id), "role": user.role.value if hasattr(user.role, "value") else str(user.role)})

        from app.core.config import settings
        return TokenResponse(
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    def login(self, db: Session, request: LoginRequest) -> TokenResponse:
        ident = (request.identifier or request.mobile or request.email or "").strip()
        user = (
            db.query(User)
            .filter((User.mobile == ident) | (User.email == ident))
            .first()
        )
        if not user or not verify_password(request.password, user.password_hash):
            raise ValueError("Invalid credentials.")

        token = create_access_token({"sub": str(user.id), "role": user.role.value if hasattr(user.role, "value") else str(user.role)})

        from app.core.config import settings
        return TokenResponse(
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )


auth_service = AuthService()
