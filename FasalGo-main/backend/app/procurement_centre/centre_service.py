from sqlalchemy.orm import Session

from . import centre_repository
from .schemas import CentreCreate, CentreUpdate


def get_all_centres(db: Session):
    return centre_repository.get_all_centres(db)


def get_centre(db: Session, centre_id: int):
    return centre_repository.get_centre(db, centre_id)


def create_centre(db: Session, centre: CentreCreate):
    return centre_repository.create_centre(db, centre)


def update_centre(db: Session, centre_id: int, centre: CentreUpdate):
    return centre_repository.update_centre(db, centre_id, centre)


def delete_centre(db: Session, centre_id: int):
    return centre_repository.delete_centre(db, centre_id)