from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.bottleneck import BottleneckActionRequest, BottleneckResponse
from app.schemas.centre import AdminStats, CounterUpdateRequest
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin", tags=["Administration"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/overview", response_model=AdminStats)
def get_admin_overview(db: DatabaseSession):
    return admin_service.get_overview_stats(db)


@router.get("/bottlenecks", response_model=List[BottleneckResponse])
def get_bottlenecks(db: DatabaseSession):
    return admin_service.get_bottlenecks(db)


@router.post("/bottlenecks/{bottleneck_id}/resolve")
def resolve_bottleneck(bottleneck_id: str, db: DatabaseSession):
    success = admin_service.resolve_bottleneck(bottleneck_id, db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bottleneck not found")
    return {"status": "success", "message": "Bottleneck action applied successfully."}


@router.post("/centres/{centre_id}/update-counters")
def update_centre_counters(
    centre_id: str,
    request: CounterUpdateRequest,
    db: DatabaseSession,
):
    try:
        centre = admin_service.update_centre_counters(centre_id, request.active_counters, db)
        return {
            "status": "success",
            "centre_id": centre.id,
            "active_counters": centre.active_counters,
            "total_counters": centre.total_counters,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
