from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
import hashlib


@dataclass
class QueueInput:
    queue_length: int
    farmers_ahead: int
    active_counters: int


@dataclass
class WaitTimePrediction:
    centre_id: str
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
        at_time: datetime,
        queue_data: QueueInput,
    ) -> WaitTimePrediction:
        """Return predicted wait time + ETA for a farmer."""
        raise NotImplementedError


class StubWaitTimePredictor(WaitTimePredictor):

    def predict(
        self,
        centre_id: str,
        farmer_lat: float,
        farmer_lon: float,
        at_time: datetime,
        queue_data: QueueInput,
    ) -> WaitTimePrediction:

        from app.data.centre_repository import centre_repository
        from app.intelligence.distance import haversine_km

        centre = centre_repository.get(centre_id)

        if centre is None:
            raise ValueError(f"Unknown centre_id: {centre_id}")

        distance_km = haversine_km(
            farmer_lat,
            farmer_lon,
            centre.coordinates.latitude,
            centre.coordinates.longitude,
        )

        # Use live M3 queue data
        queue_length = max(queue_data.queue_length, 0)
        farmers_ahead = max(queue_data.farmers_ahead, 0)
        active_counters = max(queue_data.active_counters, 1)

        # Estimate waiting time using farmers ahead
        base_wait = (
            farmers_ahead / active_counters
        ) * centre.avg_processing_time_minutes

        # If no specific farmers-ahead information is available,
        # use queue length as a fallback.
        if farmers_ahead == 0 and queue_length > 0:
            base_wait = (
                queue_length / active_counters
            ) * centre.avg_processing_time_minutes

        # Peak-hour adjustment
        hour = at_time.hour
        peak_multiplier = _hour_of_day_multiplier(hour)

        predicted_wait = round(
            base_wait * peak_multiplier,
            1
        )

        # Travel time estimate
        travel_minutes = round(
            (distance_km / 25.0) * 60,
            1
        )

        # Total ETA = travel time + waiting time
        eta_minutes = round(
            travel_minutes + predicted_wait,
            1
        )

        # Confidence
        seed = int(
            hashlib.sha256(
                centre_id.encode()
            ).hexdigest(),
            16
        ) % 100

        confidence = round(
            0.75 + (seed % 20) / 100,
            2
        )

        # Lower confidence when queue is very high
        if queue_length > centre.capacity:
            confidence = round(
                confidence - 0.15,
                2
            )

        return WaitTimePrediction(
            centre_id=centre_id,
            predicted_wait_minutes=max(
                predicted_wait,
                0.0
            ),
            eta_minutes=max(
                eta_minutes,
                0.0
            ),
            confidence=max(
                0.1,
                min(confidence, 0.99)
            ),
        )


def _hour_of_day_multiplier(hour: int) -> float:

    if 9 <= hour <= 12:
        return 1.35

    if 15 <= hour <= 17:
        return 1.20

    if hour < 6 or hour > 20:
        return 0.4

    return 0.85


_predictor_instance: WaitTimePredictor = (
    StubWaitTimePredictor()
)


def get_wait_time_predictor() -> WaitTimePredictor:
    return _predictor_instance