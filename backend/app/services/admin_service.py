from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db.models import User, UserRole
from app.services.audit_service import record_audit


class AdminService:
    def get_profile(self, db: Session, admin: User) -> User:
        record_audit(db, admin, "VIEWED_ADMIN_PROFILE")
        db.commit()
        return admin

    def list_farmers(self, db: Session, admin: User) -> tuple[list[User], int]:
        farmers = list(
            db.scalars(
                select(User)
                .where(User.role == UserRole.FARMER)
                .options(joinedload(User.farmer_profile))
                .order_by(User.id)
            ).all()
        )
        total = db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.FARMER)) or 0
        record_audit(db, admin, "LISTED_FARMERS", {"count": total})
        db.commit()
        return farmers, total

    def get_farmer(self, db: Session, admin: User, farmer_id: int) -> User:
        farmer = db.scalar(
            select(User)
            .where(User.id == farmer_id, User.role == UserRole.FARMER)
            .options(joinedload(User.farmer_profile))
        )
        if farmer is None:
            raise ValueError("Farmer not found")
        record_audit(db, admin, "VIEWED_FARMER", {"farmer_id": farmer_id})
        db.commit()
        return farmer


admin_service = AdminService()