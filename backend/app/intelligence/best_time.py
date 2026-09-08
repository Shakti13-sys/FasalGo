from datetime import datetime
from typing import List
from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import BestTimeSlot
from app.intelligence.forecast import forecast_next_hours


def recommend_best_times(
    centre: CentreSnapshot, start_time: datetime, hours: int, top_n: int = 3
) -> List[BestTimeSlot]:
    forecast_points = forecast_next_hours(centre, start_time, hours)

    ranked = sorted(forecast_points, key=lambda p: p.expected_wait_minutes)[:top_n]

    slots: List[BestTimeSlot] = []
    for point in ranked:
        reason = (
            f"Projected {point.congestion.value.lower()} congestion with an estimated "
            f"{point.expected_wait_minutes} min wait and ~{point.expected_queue} farmers in queue."
        )
        slots.append(
            BestTimeSlot(
                recommended_time=point.time,
                expected_wait_minutes=point.expected_wait_minutes,
                congestion_level=point.congestion,
                expected_queue=point.expected_queue,
                reason=reason,
            )
        )
    return slots
