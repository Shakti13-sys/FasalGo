from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.centre import CentreResponse
from app.services.centre_service import centre_service

router = APIRouter(prefix="/centres", tags=["Procurement Centres"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=List[CentreResponse])
def list_centres(
    db: DatabaseSession,
    lat: float = Query(19.9975, description="Farmer Latitude"),
    lon: float = Query(73.7898, description="Farmer Longitude"),
    search: Optional[str] = Query(None, description="Search term"),
):
    return centre_service.list_centres(db, farmer_lat=lat, farmer_lon=lon, search=search)


@router.get("/{centre_id}", response_model=CentreResponse)
def get_centre(
    centre_id: str,
    db: DatabaseSession,
    lat: float = Query(19.9975, description="Farmer Latitude"),
    lon: float = Query(73.7898, description="Farmer Longitude"),
):
    centre = centre_service.get_centre(centre_id, db, farmer_lat=lat, farmer_lon=lon)
    if not centre:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Centre not found")
    return centre
