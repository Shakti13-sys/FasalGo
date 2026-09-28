from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import OptionalCurrentUser
from app.db.session import get_db
from app.schemas.token import TokenGenerateRequest, TokenResponseModel
from app.services.token_service import token_service

router = APIRouter(prefix="/tokens", tags=["Tokens"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post("/generate", response_model=TokenResponseModel)
async def generate_token(
    request: TokenGenerateRequest,
    db: DatabaseSession,
    current_user: OptionalCurrentUser = None,
):
    try:
        return await token_service.generate_token(
            db=db,
            centre_id=request.centre_id,
            date=request.date,
            time=request.time,
            crop=request.crop or "Wheat",
            quantity=request.quantity or 85.0,
            user=current_user,
            slot_id=request.slot_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/active/me", response_model=TokenResponseModel)
def get_my_active_token(
    db: DatabaseSession, current_user: OptionalCurrentUser = None
):
    return token_service.get_active_token_for_user(current_user, db)


@router.get("/{token_id}", response_model=TokenResponseModel)
def get_token(token_id: str, db: DatabaseSession):
    try:
        return token_service.get_token(token_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
