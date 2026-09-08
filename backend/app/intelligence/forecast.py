from datetime import datetime, timedelta
from typing import List
from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import ForecastPoint
from app.intelligence.congestion import compute_congestion_index, classify_congestion

HOURLY_LOAD_SHAPE = {
    6: 0.3, 7: 0.5, 8: 0.8, 9: 1.3, 10: 1.5, 11: 1.4, 12: 1.1,
    13: 0.9, 14: 0.95, 15: 1.15, 16: 1.2, 17: 1.0, 18: 0.7,
    19: 0.4, 20: 0.2,
}
DEFAULT_LOAD_FACTOR = 0.15  # very low activity outside listed hours


def _load_factor(hour: int) -> float:
    return HOURLY_LOAD_SHAPE.get(hour, DEFAULT_LOAD_FACTOR)


def forecast_next_hours(centre: CentreSnapshot, start_time: datetime, hours: int) -> List[ForecastPoint]:
    current_hour_factor = _load_factor(start_time.hour)
    current_hour_factor = max(current_hour_factor, 0.01)

    points: List[ForecastPoint] = []
    for step in range(1, hours + 1):
        future_time = start_time + timedelta(hours=step)
        future_factor = _load_factor(future_time.hour)

        # Project queue length by scaling current queue by the ratio of
        raw_ratio = future_factor / current_hour_factor
        bounded_ratio = min(max(raw_ratio, 0.4), 2.0)
        projected_queue = max(int(round(centre.queue_length * bounded_ratio)), 0)

        projected_snapshot = centre.model_copy(update={"queue_length": projected_queue})
        index = compute_congestion_index(projected_snapshot)
        level = classify_congestion(index)

        active_counters = max(centre.active_counters, 1)
        projected_wait = round(
            (projected_queue / active_counters) * centre.avg_processing_time_minutes, 1
        )

        points.append(
            ForecastPoint(
                time=future_time.strftime("%H:%M"),
                congestion=level,
                expected_queue=projected_queue,
                expected_wait_minutes=projected_wait,
            )
        )
    return points
