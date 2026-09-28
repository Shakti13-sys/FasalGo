from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import OptionalCurrentUser
from app.db.session import get_db
from app.schemas.procurement import ProcurementResponse
from app.services.procurement_service import procurement_service

router = APIRouter(prefix="/procurement", tags=["Procurement"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/active", response_model=ProcurementResponse)
def get_active_procurement(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    return procurement_service.get_active_procurement(db, user=current_user)


@router.post("/{procurement_id}/advance-stage", response_model=ProcurementResponse)
def advance_procurement_stage(procurement_id: str, db: DatabaseSession):
    try:
        return procurement_service.advance_stage(procurement_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
