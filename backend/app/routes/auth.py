from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import CurrentUser
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegistrationRequest, TokenResponse, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(request: RegistrationRequest, db: DatabaseSession):
    try:
        return auth_service.register_farmer(db, request)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: DatabaseSession):
    try:
        return auth_service.login(db, request)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(error),
            headers={"WWW-Authenticate": "Bearer"},
        ) from error


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    return current_user
