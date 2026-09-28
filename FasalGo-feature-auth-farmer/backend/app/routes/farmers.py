from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentFarmer, CurrentUser
from app.db.session import get_db
from app.schemas.farmer import FarmerDetail, FarmerProfileResponse, FarmerProfileUpdate
from app.services.farmer_service import farmer_service


router = APIRouter(prefix="/farmers", tags=["Farmers"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/me", response_model=FarmerProfileResponse)
def get_my_profile(current_farmer: CurrentFarmer):
    try:
        return farmer_service.get_profile(current_farmer)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error


@router.put("/me", response_model=FarmerProfileResponse)
def update_my_profile(
    changes: FarmerProfileUpdate,
    db: DatabaseSession,
    current_farmer: CurrentFarmer,
):
    try:
        return farmer_service.update_profile(db, current_farmer, changes)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error


@router.get("/{farmer_id}", response_model=FarmerDetail)
def get_farmer(
    farmer_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    try:
        farmer = farmer_service.get_farmer_for_user(db, current_user, farmer_id)
    except PermissionError as error:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    return farmer