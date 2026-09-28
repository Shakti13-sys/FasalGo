from dataclasses import dataclass
from typing import Optional
from app.core.config import settings


@dataclass
class ScoreBreakdown:
    score: float
    distance_component: float
    wait_component: float
    congestion_component: float
    availability_component: float


def _normalize_inverse(value: float, cap: float) -> float:
    """Lower value => higher normalized score. Clamped to [0, 1]."""
    if value <= 0:
        return 1.0
    normalized = 1.0 - min(value / cap, 1.0)
    return max(normalized, 0.0)


def compute_score(
    distance_km: float,
    predicted_wait_minutes: float,
    congestion_index: float,
    active_counters: int,
    total_counters: int,
) -> ScoreBreakdown:
    weights = settings.SCORE_WEIGHTS

    distance_norm = _normalize_inverse(distance_km, settings.MAX_REASONABLE_DISTANCE_KM)
    wait_norm = _normalize_inverse(predicted_wait_minutes, settings.MAX_REASONABLE_WAIT_MINUTES)
    congestion_norm = max(1.0 - congestion_index, 0.0)
    availability_norm = min(active_counters / max(total_counters, 1), 1.0)

    weighted = (
        weights["distance"] * distance_norm
        + weights["wait_time"] * wait_norm
        + weights["congestion"] * congestion_norm
        + weights["availability"] * availability_norm
    )

    return ScoreBreakdown(
        score=round(weighted * 100, 1),
        distance_component=round(distance_norm, 3),
        wait_component=round(wait_norm, 3),
        congestion_component=round(congestion_norm, 3),
        availability_component=round(availability_norm, 3),
    )


def build_reasons(
    centre_name: str,
    distance_km: float,
    predicted_wait_minutes: float,
    active_counters: int,
    total_counters: int,
    is_top_choice: bool,
    comparison_centre_name: Optional[str] = None,
    comparison_wait: Optional[float] = None,
) -> list[str]:
    reasons = [
        f"Only {predicted_wait_minutes} min estimated wait time based on live queue.",
        f"{active_counters} of {total_counters} counters actively processing farmers.",
        f"Located {distance_km} km away from your location.",
    ]
    if is_top_choice and comparison_centre_name and comparison_wait is not None:
        reasons.append(
            f"Ranks above {comparison_centre_name} (~{comparison_wait} min wait) due to higher counter throughput and lower congestion."
        )
    else:
        reasons.append("Fast turnaround speed with optimal counter utilization.")
    return reasons
