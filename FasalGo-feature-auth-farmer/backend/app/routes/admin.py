from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentAdmin
from app.db.session import get_db
from app.schemas.admin import AdminFarmerDetail, AdminFarmerList, AdminProfile
from app.services.admin_service import admin_service


router = APIRouter(prefix="/admin", tags=["Administration"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/profile", response_model=AdminProfile)
def get_admin_profile(db: DatabaseSession, current_admin: CurrentAdmin):
    return admin_service.get_profile(db, current_admin)


@router.get("/farmers", response_model=AdminFarmerList)
def list_farmers(db: DatabaseSession, current_admin: CurrentAdmin):
    farmers, total = admin_service.list_farmers(db, current_admin)
    return AdminFarmerList(farmers=farmers, total=total)


@router.get("/farmers/{farmer_id}", response_model=AdminFarmerDetail)
def get_farmer(farmer_id: int, db: DatabaseSession, current_admin: CurrentAdmin):
    try:
        return admin_service.get_farmer(db, current_admin, farmer_id)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error