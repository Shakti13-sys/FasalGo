from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from . import centre_service
from .schemas import CentreCreate, CentreUpdate, CentreResponse


router = APIRouter(
    prefix="/centres",
    tags=["Procurement Centres"]
)


@router.get("/")
def get_all_centres(db: Session = Depends(get_db)):
    return centre_service.get_all_centres(db)


@router.get("/{centre_id}")
def get_centre(
    centre_id: int,
    db: Session = Depends(get_db)
):
    centre = centre_service.get_centre(db, centre_id)

    if not centre:
        raise HTTPException(
            status_code=404,
            detail="Procurement centre not found"
        )

    return centre


@router.post("/")
def create_centre(
    centre: CentreCreate,
    db: Session = Depends(get_db)
):
    return centre_service.create_centre(db, centre)


@router.put("/{centre_id}")
def update_centre(
    centre_id: int,
    centre: CentreUpdate,
    db: Session = Depends(get_db)
):
    updated_centre = centre_service.update_centre(
        db,
        centre_id,
        centre
    )

    if not updated_centre:
        raise HTTPException(
            status_code=404,
            detail="Procurement centre not found"
        )

    return updated_centre


@router.delete("/{centre_id}")
def delete_centre(
    centre_id: int,
    db: Session = Depends(get_db)
):
    deleted_centre = centre_service.delete_centre(
        db,
        centre_id
    )

    if not deleted_centre:
        raise HTTPException(
            status_code=404,
            detail="Procurement centre not found"
        )

    return {
        "message": "Procurement centre deleted successfully"
    }