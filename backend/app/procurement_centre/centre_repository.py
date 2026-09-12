from sqlalchemy.orm import Session

from .models import ProcurementCentre
from .schemas import CentreCreate, CentreUpdate


def get_all_centres(db: Session):
    return db.query(ProcurementCentre).all()


def get_centre(db: Session, centre_id: int):
    return (
        db.query(ProcurementCentre)
        .filter(ProcurementCentre.id == centre_id)
        .first()
    )


def create_centre(db: Session, centre: CentreCreate):
    new_centre = ProcurementCentre(
        name=centre.name,
        address=centre.address,
        district=centre.district,
        state=centre.state,
        latitude=centre.latitude,
        longitude=centre.longitude,
        working_hours=centre.working_hours,
        total_counters=centre.total_counters,
        active_counters=centre.active_counters,
        average_processing_time=centre.average_processing_time,
        status=centre.status,
    )

    db.add(new_centre)
    db.commit()
    db.refresh(new_centre)

    return new_centre


def update_centre(db: Session, centre_id: int, centre_data: CentreUpdate):
    centre = get_centre(db, centre_id)

    if not centre:
        return None

    update_data = centre_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(centre, key, value)

    db.commit()
    db.refresh(centre)

    return centre


def delete_centre(db: Session, centre_id: int):
    centre = get_centre(db, centre_id)

    if not centre:
        return None

    db.delete(centre)
    db.commit()

    return centre