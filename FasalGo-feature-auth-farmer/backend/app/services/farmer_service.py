from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import FarmerProfile, User, UserRole
from app.schemas.farmer import FarmerProfileUpdate
from app.services.audit_service import record_audit


class FarmerService:
    def get_profile(self, user: User) -> FarmerProfile:
        if user.farmer_profile is None:
            raise ValueError("Farmer profile not found")
        return user.farmer_profile

    def update_profile(
        self, db: Session, user: User, changes: FarmerProfileUpdate
    ) -> FarmerProfile:
        profile = self.get_profile(user)
        for field, value in changes.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        record_audit(db, user, "PROFILE_UPDATED")
        db.commit()
        db.refresh(profile)
        return profile

    def get_farmer_for_user(self, db: Session, current_user: User, farmer_id: int) -> User:
        farmer = db.scalar(
            select(User).where(User.id == farmer_id, User.role == UserRole.FARMER)
        )
        if farmer is None:
            raise ValueError("Farmer not found")
        if current_user.role != UserRole.ADMIN and current_user.id != farmer.id:
            raise PermissionError("You may only access your own farmer profile")
        return farmer


farmer_service = FarmerService()