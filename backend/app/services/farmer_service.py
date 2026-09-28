from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.models import FarmerProfile, Notification, User
from app.schemas.farmer import FarmerProfileResponse, FarmerProfileUpdate, NotificationItem


class FarmerService:
    def get_profile(self, user: User, db: Session) -> FarmerProfileResponse:
        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        return FarmerProfileResponse(
            id=str(user.id),
            name=user.name,
            mobile=user.mobile,
            location=profile.location if profile and profile.location else "Panchavati",
            state=profile.state if profile and profile.state else "Maharashtra",
            district=profile.district if profile and profile.district else "Nashik",
            crop=profile.crop if profile and profile.crop else "Wheat",
            expectedQuantity=profile.quantity if profile and profile.quantity else 85.0,
            avatar=None,
            latitude=profile.latitude if profile else 19.9975,
            longitude=profile.longitude if profile else 73.7898,
        )

    def update_profile(
        self, db: Session, user: User, changes: FarmerProfileUpdate
    ) -> FarmerProfileResponse:
        if changes.name:
            user.name = changes.name

        profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
        if not profile:
            profile = FarmerProfile(user_id=user.id)
            db.add(profile)

        if changes.location is not None:
            profile.location = changes.location
        if changes.state is not None:
            profile.state = changes.state
        if changes.district is not None:
            profile.district = changes.district
        if changes.crop is not None:
            profile.crop = changes.crop
        if changes.expected_quantity is not None:
            profile.quantity = changes.expected_quantity
        if changes.latitude is not None:
            profile.latitude = changes.latitude
        if changes.longitude is not None:
            profile.longitude = changes.longitude

        db.commit()
        db.refresh(user)
        return self.get_profile(user, db)

    def get_notifications(self, user: User, db: Session) -> List[NotificationItem]:
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user.id)
            .order_by(Notification.id.desc())
            .all()
        )
        return [
            NotificationItem(
                id=n.id,
                type=n.type,
                title=n.title,
                message=n.message,
                timestamp=n.timestamp,
                read=n.read,
            )
            for n in notifications
        ]

    def mark_all_notifications_read(self, user: User, db: Session) -> None:
        db.query(Notification).filter(Notification.user_id == user.id).update({"read": True})
        db.commit()


farmer_service = FarmerService()
