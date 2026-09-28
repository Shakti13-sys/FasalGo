from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser, OptionalCurrentUser
from app.db.models import User
from app.db.session import get_db
from app.schemas.farmer import FarmerProfileResponse, FarmerProfileUpdate, NotificationItem
from app.services.farmer_service import farmer_service

router = APIRouter(prefix="/farmers", tags=["Farmers"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/me", response_model=FarmerProfileResponse)
def get_my_profile(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    if not current_user:
        # Fallback to default user
        user = db.query(User).filter(User.mobile == "9876543210").first()
        if not user:
            user = db.query(User).first()
    else:
        user = current_user

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found")
    return farmer_service.get_profile(user, db)


@router.put("/me", response_model=FarmerProfileResponse)
def update_my_profile(
    changes: FarmerProfileUpdate,
    db: DatabaseSession,
    current_user: OptionalCurrentUser = None,
):
    if not current_user:
        user = db.query(User).filter(User.mobile == "9876543210").first() or db.query(User).first()
    else:
        user = current_user

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found")
    return farmer_service.update_profile(db, user, changes)


@router.get("/notifications", response_model=List[NotificationItem])
def get_notifications(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    if not current_user:
        user = db.query(User).filter(User.mobile == "9876543210").first() or db.query(User).first()
    else:
        user = current_user

    if not user:
        return []
    return farmer_service.get_notifications(user, db)


@router.post("/notifications/read-all")
def mark_all_read(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    if not current_user:
        user = db.query(User).filter(User.mobile == "9876543210").first() or db.query(User).first()
    else:
        user = current_user

    if user:
        farmer_service.mark_all_notifications_read(user, db)
    return {"status": "ok"}
