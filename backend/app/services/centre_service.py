from typing import List, Optional
from sqlalchemy.orm import Session

from app.data.queue_repository import queue_repository
from app.db.models import ProcurementCentre
from app.intelligence.congestion import classify_congestion, compute_congestion_index
from app.intelligence.distance import haversine_km
from app.schemas.centre import CentreResponse
from app.schemas.common import CentreSnapshot, Coordinates


class CentreService:
    def list_centres(
        self,
        db: Session,
        farmer_lat: float = 19.9975,
        farmer_lon: float = 73.7898,
        search: Optional[str] = None,
    ) -> List[CentreResponse]:
        query = db.query(ProcurementCentre)
        if search:
            search_str = f"%{search.lower()}%"
            query = query.filter(
                (ProcurementCentre.name.ilike(search_str))
                | (ProcurementCentre.address.ilike(search_str))
            )
        centres = query.all()

        results: List[CentreResponse] = []
        for c in centres:
            queue_state = queue_repository.get_queue(c.id, db=db)
            distance = haversine_km(farmer_lat, farmer_lon, c.latitude, c.longitude)

            results.append(
                CentreResponse(
                    id=c.id,
                    name=c.name,
                    code=c.code,
                    distance=distance,
                    lat=c.latitude,
                    lng=c.longitude,
                    queue=queue_state.queue_length,
                    activeCounters=c.active_counters,
                    totalCounters=c.total_counters,
                    avgProcessingTime=c.avg_processing_time_minutes,
                    capacity=c.capacity,
                    congestion=queue_state.congestion_level,
                    waitTime=queue_state.avg_wait_minutes,
                    processingSpeed=c.processing_speed,
                    address=c.address,
                )
            )

        # Sort by distance
        results.sort(key=lambda x: x.distance)
        return results

    def get_centre(
        self,
        centre_id: str,
        db: Session,
        farmer_lat: float = 19.9975,
        farmer_lon: float = 73.7898,
    ) -> Optional[CentreResponse]:
        c = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
        if not c:
            return None

        queue_state = queue_repository.get_queue(c.id, db=db)
        distance = haversine_km(farmer_lat, farmer_lon, c.latitude, c.longitude)

        return CentreResponse(
            id=c.id,
            name=c.name,
            code=c.code,
            distance=distance,
            lat=c.latitude,
            lng=c.longitude,
            queue=queue_state.queue_length,
            activeCounters=c.active_counters,
            totalCounters=c.total_counters,
            avgProcessingTime=c.avg_processing_time_minutes,
            capacity=c.capacity,
            congestion=queue_state.congestion_level,
            waitTime=queue_state.avg_wait_minutes,
            processingSpeed=c.processing_speed,
            address=c.address,
        )


centre_service = CentreService()
