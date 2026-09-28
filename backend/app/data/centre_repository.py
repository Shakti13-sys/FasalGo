from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.models import ProcurementCentre
from app.db.session import SessionLocal
from app.intelligence.distance import haversine_km
from app.schemas.common import CentreSnapshot, Coordinates


class CentreRepository:
    def get(self, centre_id: str, db: Optional[Session] = None) -> Optional[CentreSnapshot]:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
            if not centre:
                return None
            return self._to_snapshot(centre)
        finally:
            if close_on_exit:
                db.close()

    def list_all(self, db: Optional[Session] = None) -> List[CentreSnapshot]:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            centres = db.query(ProcurementCentre).all()
            return [self._to_snapshot(c) for c in centres]
        finally:
            if close_on_exit:
                db.close()

    def list_nearby(
        self, farmer_lat: float, farmer_lon: float, max_km: float = 50.0, db: Optional[Session] = None
    ) -> List[CentreSnapshot]:
        all_centres = self.list_all(db=db)
        return [
            c
            for c in all_centres
            if haversine_km(farmer_lat, farmer_lon, c.coordinates.latitude, c.coordinates.longitude)
            <= max_km
        ]

    def _to_snapshot(self, c: ProcurementCentre) -> CentreSnapshot:
        # Default queue based on centre
        queue_base = {"c1": 21, "c2": 28, "c3": 35, "c4": 12, "c5": 24}.get(c.id, 15)
        return CentreSnapshot(
            centre_id=c.id,
            name=c.name,
            coordinates=Coordinates(latitude=c.latitude, longitude=c.longitude),
            active_counters=c.active_counters,
            total_counters=c.total_counters,
            queue_length=queue_base,
            avg_processing_time_minutes=c.avg_processing_time_minutes,
            capacity=c.capacity,
            processing_speed=c.processing_speed,
            operational_status=c.operational_status,
            address=c.address,
        )


centre_repository = CentreRepository()
