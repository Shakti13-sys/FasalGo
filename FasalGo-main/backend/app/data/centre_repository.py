from typing import Dict, List, Optional
from app.schemas.common import CentreSnapshot, Coordinates
from app.core.constants import OperationalStatus


def _build_synthetic_centres() -> Dict[str, CentreSnapshot]:
    raw = [
        dict(centre_id="C001", name="Nashik Road Mandi", lat=19.9975, lon=73.7898,
             queue_length=8, active_counters=3, total_counters=4, capacity=150,
             avg_processing_time_minutes=6.0, status=OperationalStatus.OPEN),
        dict(centre_id="C002", name="Panchavati Procurement Centre", lat=20.0140, lon=73.7900,
             queue_length=42, active_counters=2, total_counters=4, capacity=120,
             avg_processing_time_minutes=7.5, status=OperationalStatus.OPEN),
        dict(centre_id="C003", name="Deolali Camp Centre", lat=19.9490, lon=73.8330,
             queue_length=15, active_counters=4, total_counters=4, capacity=200,
             avg_processing_time_minutes=5.0, status=OperationalStatus.OPEN),
        dict(centre_id="C004", name="Sinnar Taluka Centre", lat=19.8490, lon=73.9980,
             queue_length=65, active_counters=1, total_counters=3, capacity=100,
             avg_processing_time_minutes=8.0, status=OperationalStatus.OPEN),
        dict(centre_id="C005", name="Igatpuri Ghat Road Centre", lat=19.6970, lon=73.5620,
             queue_length=3, active_counters=2, total_counters=3, capacity=90,
             avg_processing_time_minutes=6.5, status=OperationalStatus.PAUSED),
    ]
    centres = {}
    for r in raw:
        centres[r["centre_id"]] = CentreSnapshot(
            centre_id=r["centre_id"],
            name=r["name"],
            coordinates=Coordinates(latitude=r["lat"], longitude=r["lon"]),
            queue_length=r["queue_length"],
            active_counters=r["active_counters"],
            total_counters=r["total_counters"],
            capacity=r["capacity"],
            avg_processing_time_minutes=r["avg_processing_time_minutes"],
            operational_status=r["status"],
        )
    return centres


class CentreRepository:
    def __init__(self):
        self._centres: Dict[str, CentreSnapshot] = _build_synthetic_centres()

    def get(self, centre_id: str) -> Optional[CentreSnapshot]:
        return self._centres.get(centre_id)

    def list_all(self) -> List[CentreSnapshot]:
        return list(self._centres.values())

    def list_nearby(self, lat: float, lon: float, max_km: float = 25.0) -> List[CentreSnapshot]:
        from app.intelligence.distance import haversine_km
        result = []
        for c in self._centres.values():
            d = haversine_km(lat, lon, c.coordinates.latitude, c.coordinates.longitude)
            if d <= max_km:
                result.append(c)
        return result


centre_repository = CentreRepository()
