from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
import hashlib


@dataclass
class WaitTimePrediction:
    centre_id: str
    predicted_wait_minutes: float
    eta_minutes: float          # travel time + predicted wait
    confidence: float           # 0-1


class WaitTimePredictor(ABC):
    @abstractmethod
    def predict(
        self,
        centre_id: str,
        farmer_lat: float,
        farmer_lon: float,
        at_time: datetime,
    ) -> WaitTimePrediction:
        """Return predicted wait time + ETA for a farmer travelling to a centre."""
        raise NotImplementedError


class StubWaitTimePredictor(WaitTimePredictor):
    def predict(
        self,
        centre_id: str,
        farmer_lat: float,
        farmer_lon: float,
        at_time: datetime,
    ) -> WaitTimePrediction:
        from app.data.centre_repository import centre_repository
        from app.intelligence.distance import haversine_km

        centre = centre_repository.get(centre_id)
        if centre is None:
            raise ValueError(f"Unknown centre_id: {centre_id}")

        distance_km = haversine_km(
            farmer_lat, farmer_lon,
            centre.coordinates.latitude, centre.coordinates.longitude,
        )

        # Synthetic but structurally realistic wait-time model:
        active_counters = max(centre.active_counters, 1)
        base_wait = (centre.queue_length / active_counters) * centre.avg_processing_time_minutes

        hour = at_time.hour
        peak_multiplier = _hour_of_day_multiplier(hour)
        predicted_wait = round(base_wait * peak_multiplier, 1)

        # Travel time estimate: assume ~25 km/h effective rural travel speed.
        travel_minutes = round((distance_km / 25.0) * 60, 1)
        eta_minutes = round(travel_minutes + predicted_wait, 1)

        # Confidence: deterministic pseudo-value based on data completeness,
        seed = int(hashlib.sha256(centre_id.encode()).hexdigest(), 16) % 100
        confidence = round(0.75 + (seed % 20) / 100, 2)  # 0.75 - 0.94
        if centre.queue_length > centre.capacity:
            confidence = round(confidence - 0.15, 2)

        return WaitTimePrediction(
            centre_id=centre_id,
            predicted_wait_minutes=max(predicted_wait, 0.0),
            eta_minutes=max(eta_minutes, 0.0),
            confidence=max(0.1, min(confidence, 0.99)),
        )


def _hour_of_day_multiplier(hour: int) -> float:
    if 9 <= hour <= 12:
        return 1.35
    if 15 <= hour <= 17:
        return 1.20
    if hour < 6 or hour > 20:
        return 0.4  # centres barely active
    return 0.85


_predictor_instance: WaitTimePredictor = StubWaitTimePredictor()


def get_wait_time_predictor() -> WaitTimePredictor:
    return _predictor_instance
