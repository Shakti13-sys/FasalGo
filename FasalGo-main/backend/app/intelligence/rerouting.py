from dataclasses import dataclass
from typing import Optional
from app.core.config import settings


@dataclass
class RerouteDecision:
    should_reroute: bool
    improvement_minutes: Optional[float]
    improvement_pct: Optional[float]
    reason: str


def evaluate_reroute(
    current_centre_id: str,
    current_live_eta_minutes: float,
    booked_at_eta_minutes: float,
    alternative_centre_id: Optional[str],
    alternative_eta_minutes: Optional[float],
) -> RerouteDecision:

    if alternative_centre_id is None or alternative_eta_minutes is None:
        return RerouteDecision(
            should_reroute=False,
            improvement_minutes=None,
            improvement_pct=None,
            reason="No suitable alternative centre found nearby.",
        )

    improvement_minutes = round(current_live_eta_minutes - alternative_eta_minutes, 1)
    improvement_pct = (
        round((improvement_minutes / current_live_eta_minutes) * 100, 1)
        if current_live_eta_minutes > 0 else 0.0
    )

    meets_absolute = improvement_minutes >= settings.REROUTE_MIN_ABSOLUTE_IMPROVEMENT_MINUTES
    meets_relative = improvement_pct >= settings.REROUTE_MIN_RELATIVE_IMPROVEMENT_PCT

    if meets_absolute and meets_relative:
        reason = (
            f"Current centre ETA has risen to {current_live_eta_minutes} min "
            f"(originally quoted {booked_at_eta_minutes} min). Centre {alternative_centre_id} "
            f"is expected to serve the farmer in {alternative_eta_minutes} min, "
            f"an improvement of {improvement_minutes} min ({improvement_pct}%). "
            f"Switching is recommended."
        )
        return RerouteDecision(
            should_reroute=True,
            improvement_minutes=improvement_minutes,
            improvement_pct=improvement_pct,
            reason=reason,
        )

    reason = (
        f"Current centre ETA is {current_live_eta_minutes} min. Best alternative "
        f"({alternative_centre_id}) offers {alternative_eta_minutes} min "
        f"({improvement_minutes} min / {improvement_pct}% improvement), which does not "
        f"clear the minimum threshold for a reroute recommendation."
    )
    return RerouteDecision(
        should_reroute=False,
        improvement_minutes=improvement_minutes,
        improvement_pct=improvement_pct,
        reason=reason,
    )
