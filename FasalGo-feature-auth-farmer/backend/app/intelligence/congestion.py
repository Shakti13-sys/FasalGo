from app.schemas.common import CentreSnapshot
from app.core.config import settings
from app.core.constants import CongestionLevel

BASELINE_PROCESSING_MINUTES = 6.0  # typical processing time used as a reference point
COUNTER_LOAD_SATURATION = 20.0     # queue-per-counter value considered "maxed out"


def compute_congestion_index(centre: CentreSnapshot) -> float:
    active_counters = max(centre.active_counters, 1)

    counter_load = centre.queue_length / active_counters
    counter_load_norm = min(counter_load / COUNTER_LOAD_SATURATION, 1.0)

    utilization = centre.queue_length / max(centre.capacity, 1)
    utilization_norm = min(utilization, 1.0)

    processing_drag = centre.avg_processing_time_minutes / BASELINE_PROCESSING_MINUTES
    processing_drag_norm = min(max((processing_drag - 1.0), 0.0), 1.0)

    index = (
        0.5 * counter_load_norm
        + 0.35 * utilization_norm
        + 0.15 * processing_drag_norm
    )
    return round(min(max(index, 0.0), 1.0), 3)


def classify_congestion(index: float) -> CongestionLevel:
    if index <= settings.CONGESTION_LOW_MAX:
        return CongestionLevel.LOW
    if index <= settings.CONGESTION_MEDIUM_MAX:
        return CongestionLevel.MEDIUM
    return CongestionLevel.HIGH


def congestion_explanation(centre: CentreSnapshot, index: float, level: CongestionLevel) -> str:
    active_counters = max(centre.active_counters, 1)
    per_counter = round(centre.queue_length / active_counters, 1)
    return (
        f"{level.value} congestion (index={index}): {centre.queue_length} farmers in queue "
        f"across {centre.active_counters} active counter(s) (~{per_counter} per counter), "
        f"at {round((centre.queue_length / max(centre.capacity,1)) * 100, 1)}% of daily capacity."
    )
