from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class WaitTimePrediction:
    predicted_wait_minutes: float
    eta_minutes: float
    confidence: float


class WaitTimePredictor(ABC):
    @abstractmethod
    def predict(
        self,
        centre_id: str,
        farmer_lat: float,
        farmer_lon: float,
        at_time: Optional[datetime] = None,
        queue_length: Optional[int] = None,
        active_counters: Optional[int] = None,
        avg_processing_time: Optional[float] = None,
    ) -> WaitTimePrediction:
        pass


class RealTimeWaitPredictor(WaitTimePredictor):
    """
    Predicts wait time and ETA using live queue state, active counter throughput,
    and road transit time based on Haversine distance.
    """

    def predict(
        self,
        centre_id: str,
        farmer_lat: float,
        farmer_lon: float,
        at_time: Optional[datetime] = None,
        queue_length: Optional[int] = None,
        active_counters: Optional[int] = None,
        avg_processing_time: Optional[float] = None,
    ) -> WaitTimePrediction:
        from app.db.models import ProcurementCentre
        from app.db.session import SessionLocal
        from app.intelligence.distance import haversine_km

        q_len = queue_length if queue_length is not None else 15
        counters = active_counters if active_counters is not None else 3
        proc_time = avg_processing_time if avg_processing_time is not None else 6.0

        c_lat, c_lon = 19.9975, 73.7898

        # Lookup centre details from DB if available
        try:
            with SessionLocal() as db:
                centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
                if centre:
                    c_lat, c_lon = centre.latitude, centre.longitude
                    if active_counters is None:
                        counters = max(centre.active_counters, 1)
                    if avg_processing_time is None:
                        proc_time = centre.avg_processing_time_minutes
        except Exception:
            pass

        # Travel time (assuming avg speed 35 km/h)
        distance = haversine_km(farmer_lat, farmer_lon, c_lat, c_lon)
        travel_minutes = (distance / 35.0) * 60.0

        # Queue wait time
        wait_minutes = (q_len / max(counters, 1)) * proc_time
        total_eta = round(travel_minutes + wait_minutes, 1)

        # Confidence score (higher when counters > 1 and queue reasonable)
        base_confidence = 94.0 - min(q_len * 0.4, 20.0)
        confidence = round(max(70.0, min(96.0, base_confidence)), 1)

        return WaitTimePrediction(
            predicted_wait_minutes=round(wait_minutes, 1),
            eta_minutes=total_eta,
            confidence=confidence,
        )


_predictor_instance: WaitTimePredictor = RealTimeWaitPredictor()


def get_wait_time_predictor() -> WaitTimePredictor:
    return _predictor_instance
