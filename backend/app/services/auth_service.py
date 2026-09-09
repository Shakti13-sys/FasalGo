from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import FarmerProfile, User, UserRole
from app.schemas.auth import LoginRequest, RegistrationRequest
from app.services.audit_service import record_audit


class AuthService:
    def register_farmer(self, db: Session, request: RegistrationRequest) -> User:
        user = User(
            name=request.name.strip(),
            email=request.email,
            password_hash=hash_password(request.password),
            role=UserRole.FARMER,
            is_active=True,
        )
        user.farmer_profile = FarmerProfile()
        db.add(user)
        try:
            db.flush()
            record_audit(db, user, "REGISTRATION")
            db.commit()
        except IntegrityError:
            db.rollback()
            raise ValueError("An account with this email already exists") from None
        db.refresh(user)
        return user

    def authenticate(self, db: Session, request: LoginRequest) -> User:
        user = db.scalar(select(User).where(User.email == request.email))
        if user is None:
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("This account is inactive")
        if not verify_password(request.password, user.password_hash):
            record_audit(db, user, "FAILED_LOGIN")
            db.commit()
            raise ValueError("Invalid email or password")
        record_audit(db, user, "SUCCESSFUL_LOGIN")
        db.commit()
        db.refresh(user)
        return user

    def login(self, db: Session, request: LoginRequest) -> tuple[str, int]:
        user = self.authenticate(db, request)
        token = create_access_token(user.id, user.role.value)
        return token, user.id


auth_service = AuthService()