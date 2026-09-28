from datetime import datetime, timedelta
from typing import List
from app.intelligence.congestion import classify_congestion, compute_congestion_index
from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import ForecastPoint

HOURLY_LOAD_SHAPE = {
    6: 0.3,
    7: 0.5,
    8: 0.8,
    9: 1.3,
    10: 1.5,
    11: 1.4,
    12: 1.1,
    13: 0.9,
    14: 0.95,
    15: 1.15,
    16: 1.2,
    17: 1.0,
    18: 0.7,
    19: 0.4,
    20: 0.2,
}
DEFAULT_LOAD_FACTOR = 0.15


def _load_factor(hour: int) -> float:
    return HOURLY_LOAD_SHAPE.get(hour, DEFAULT_LOAD_FACTOR)


def forecast_next_hours(centre: CentreSnapshot, start_time: datetime, hours: int = 5) -> List[ForecastPoint]:
    current_hour_factor = _load_factor(start_time.hour)
    current_hour_factor = max(current_hour_factor, 0.01)

    points: List[ForecastPoint] = []
    for step in range(1, hours + 1):
        future_time = start_time + timedelta(hours=step)
        future_factor = _load_factor(future_time.hour)

        raw_ratio = future_factor / current_hour_factor
        bounded_ratio = min(max(raw_ratio, 0.4), 2.0)
        projected_queue = max(int(round(centre.queue_length * bounded_ratio)), 0)

        projected_snapshot = centre.model_copy(update={"queue_length": projected_queue})
        index = compute_congestion_index(projected_snapshot)
        level = classify_congestion(index)

        # Format hour label like "11:00 AM", "12:00 PM"
        hour_str = future_time.strftime("%I:%M %p").lstrip("0")

        points.append(
            ForecastPoint(
                hour=hour_str,
                level=level.value.lower(),
                value=int(index * 100),
                predictedFarmers=projected_queue,
            )
        )
    return points
