from collections.abc import Callable, Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.models import User, UserRole
from app.db.session import get_db


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        subject = payload.get("sub")
        user_id = int(subject) if subject is not None else None
    except (InvalidTokenError, TypeError, ValueError, RuntimeError):
        raise credentials_error from None

    user = db.get(User, user_id) if user_id is not None else None
    if user is None or not user.is_active:
        raise credentials_error
    return user


def require_role(required_role: UserRole) -> Callable:
    def role_dependency(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_dependency


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentFarmer = Annotated[User, Depends(require_role(UserRole.FARMER))]
CurrentAdmin = Annotated[User, Depends(require_role(UserRole.ADMIN))]