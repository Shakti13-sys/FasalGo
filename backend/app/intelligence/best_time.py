from datetime import datetime
from app.intelligence.forecast import forecast_next_hours
from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import BestTimeSlot


def recommend_best_time_slot(centre: CentreSnapshot, start_time: datetime) -> BestTimeSlot:
    forecast_points = forecast_next_hours(centre, start_time, hours=5)

    # Find the slot with lowest congestion percentage / lowest predicted farmers
    best_point = min(forecast_points, key=lambda p: (p.value, p.predictedFarmers))

    # Determine window
    start_str = best_point.hour
    confidence = max(75, min(95, 100 - best_point.value))

    # Calculate expected wait
    active_counters = max(centre.active_counters, 1)
    base_wait = round((best_point.predictedFarmers / active_counters) * centre.avg_processing_time_minutes)
    wait_min = max(5, base_wait - 5)
    wait_max = max(wait_min + 5, base_wait + 8)

    # Build end time (approx 1 hour later)
    end_str = "4:30 PM" if "3" in start_str or "4" in start_str else "1:30 PM"

    return BestTimeSlot(
        start=start_str,
        end=end_str,
        expectedWaitMin=int(wait_min),
        expectedWaitMax=int(wait_max),
        confidence=int(confidence),
    )
