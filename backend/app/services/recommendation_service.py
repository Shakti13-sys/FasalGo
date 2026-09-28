from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.constants import OperationalStatus
from app.data.centre_repository import centre_repository
from app.data.queue_repository import queue_repository
from app.integrations.m3_client import get_queue_data_provider
from app.integrations.m4_client import get_wait_time_predictor
from app.intelligence.best_time import recommend_best_time_slot
from app.intelligence.congestion import (
    classify_congestion,
    compute_congestion_index,
    congestion_explanation,
)
from app.intelligence.distance import haversine_km
from app.intelligence.forecast import forecast_next_hours
from app.intelligence.rerouting import evaluate_reroute
from app.intelligence.scoring import build_reasons, compute_score
from app.schemas.centre import CentreResponse
from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import (
    BestTimeSlot,
    CentreRecommendation,
    CongestionResponse,
    ForecastPoint,
    RerouteResponse,
)


class RecommendationService:
    def __init__(self):
        self.wait_time_predictor = get_wait_time_predictor()
        self.queue_provider = get_queue_data_provider()

    def recommend_centres(
        self,
        farmer_lat: float,
        farmer_lon: float,
        db: Optional[Session] = None,
        at_time: Optional[datetime] = None,
    ) -> List[CentreRecommendation]:
        at_time = at_time or datetime.now(timezone.utc)
        centres = centre_repository.list_nearby(
            farmer_lat, farmer_lon, max_km=settings.MAX_REASONABLE_DISTANCE_KM, db=db
        )
        centres = [c for c in centres if c.operational_status == OperationalStatus.OPEN]
        if not centres:
            centres = centre_repository.list_all(db=db)

        scored = []
        for centre in centres:
            distance_km = haversine_km(
                farmer_lat, farmer_lon, centre.coordinates.latitude, centre.coordinates.longitude
            )
            # Fetch live queue state
            queue_state = queue_repository.get_queue(centre.centre_id, db=db)
            centre.queue_length = queue_state.queue_length

            prediction = self.wait_time_predictor.predict(
                centre_id=centre.centre_id,
                farmer_lat=farmer_lat,
                farmer_lon=farmer_lon,
                at_time=at_time,
                queue_length=centre.queue_length,
                active_counters=centre.active_counters,
                avg_processing_time=centre.avg_processing_time_minutes,
            )
            congestion_index = compute_congestion_index(centre)
            level = classify_congestion(congestion_index)

            breakdown = compute_score(
                distance_km=distance_km,
                predicted_wait_minutes=prediction.predicted_wait_minutes,
                congestion_index=congestion_index,
                active_counters=centre.active_counters,
                total_counters=centre.total_counters,
            )
            scored.append((centre, distance_km, prediction, congestion_index, level, breakdown, queue_state))

        # Rank descending by score
        scored.sort(key=lambda x: x[5].score, reverse=True)
        nearest_entry = min(scored, key=lambda x: x[1]) if scored else None

        results: List[CentreRecommendation] = []
        for rank, (centre, distance_km, prediction, congestion_index, level, breakdown, queue_state) in enumerate(
            scored, start=1
        ):
            is_top = rank == 1
            comparison_name = None
            comparison_wait = None
            if is_top and nearest_entry and nearest_entry[0].centre_id != centre.centre_id:
                comparison_name = nearest_entry[0].name
                comparison_wait = nearest_entry[2].predicted_wait_minutes

            reasons = build_reasons(
                centre_name=centre.name,
                distance_km=distance_km,
                predicted_wait_minutes=prediction.predicted_wait_minutes,
                active_counters=centre.active_counters,
                total_counters=centre.total_counters,
                is_top_choice=is_top,
                comparison_centre_name=comparison_name,
                comparison_wait=comparison_wait,
            )

            centre_resp = CentreResponse(
                id=centre.centre_id,
                name=centre.name,
                code=centre.centre_id.upper(),
                distance=distance_km,
                lat=centre.coordinates.latitude,
                lng=centre.coordinates.longitude,
                queue=centre.queue_length,
                activeCounters=centre.active_counters,
                totalCounters=centre.total_counters,
                avgProcessingTime=centre.avg_processing_time_minutes,
                capacity=centre.capacity,
                congestion=level.value.lower(),
                waitTime=int(prediction.predicted_wait_minutes),
                processingSpeed=centre.processing_speed,
                address=centre.address,
            )

            results.append(
                CentreRecommendation(
                    centre=centre_resp,
                    rank=rank,
                    score=breakdown.score,
                    reasons=reasons,
                    isTop=is_top,
                )
            )
        return results

    def best_time(self, centre_id: str = "c1", db: Optional[Session] = None) -> BestTimeSlot:
        centre = centre_repository.get(centre_id, db=db)
        if not centre:
            centre = centre_repository.get("c1", db=db)
        at_time = datetime.now()
        return recommend_best_time_slot(centre, at_time)

    def get_forecast(self, centre_id: str = "c1", db: Optional[Session] = None) -> List[ForecastPoint]:
        centre = centre_repository.get(centre_id, db=db)
        if not centre:
            centre = centre_repository.get("c1", db=db)
        at_time = datetime.now()
        return forecast_next_hours(centre, at_time, hours=settings.FORECAST_HORIZON_HOURS)

    def get_congestion(self, centre_id: str, db: Optional[Session] = None) -> CongestionResponse:
        centre = centre_repository.get(centre_id, db=db)
        if not centre:
            raise ValueError(f"Centre not found: {centre_id}")

        index = compute_congestion_index(centre)
        level = classify_congestion(index)
        utilization_pct = round((centre.queue_length / max(centre.capacity, 1)) * 100, 1)

        return CongestionResponse(
            centre_id=centre.centre_id,
            centre_name=centre.name,
            congestion_level=level.value.lower(),
            congestion_index=index,
            queue_length=centre.queue_length,
            active_counters=centre.active_counters,
            utilization_pct=utilization_pct,
            explanation=congestion_explanation(centre, index, level),
        )

    def evaluate_reroute_for_token(
        self, token_id: str, db: Optional[Session] = None
    ) -> RerouteResponse:
        token_info = self.queue_provider.get_token_info(token_id)
        current_centre = centre_repository.get(token_info.centre_id, db=db)
        if not current_centre:
            current_centre = centre_repository.get("c1", db=db)

        at_time = datetime.now()
        current_prediction = self.wait_time_predictor.predict(
            current_centre.centre_id,
            token_info.farmer_lat,
            token_info.farmer_lon,
            at_time=at_time,
            queue_length=current_centre.queue_length,
            active_counters=current_centre.active_counters,
            avg_processing_time=current_centre.avg_processing_time_minutes,
        )

        nearby = centre_repository.list_nearby(
            token_info.farmer_lat, token_info.farmer_lon, max_km=settings.MAX_REASONABLE_DISTANCE_KM, db=db
        )
        alternatives = [
            c
            for c in nearby
            if c.centre_id != current_centre.centre_id and c.operational_status == OperationalStatus.OPEN
        ]

        best_alt_id = None
        best_alt_name = None
        best_alt_eta = None

        if alternatives:
            alt_predictions = []
            for alt in alternatives:
                p = self.wait_time_predictor.predict(
                    alt.centre_id,
                    token_info.farmer_lat,
                    token_info.farmer_lon,
                    at_time=at_time,
                    queue_length=alt.queue_length,
                    active_counters=alt.active_counters,
                    avg_processing_time=alt.avg_processing_time_minutes,
                )
                alt_predictions.append((alt, p.predicted_wait_minutes))
            best_alt = min(alt_predictions, key=lambda item: item[1])
            best_alt_id, best_alt_name, best_alt_eta = (
                best_alt[0].centre_id,
                best_alt[0].name,
                best_alt[1],
            )

        decision = evaluate_reroute(
            current_centre_id=current_centre.centre_id,
            current_centre_name=current_centre.name,
            current_live_eta_minutes=current_prediction.predicted_wait_minutes,
            booked_at_eta_minutes=token_info.booked_at_eta_minutes,
            alternative_centre_id=best_alt_id,
            alternative_centre_name=best_alt_name,
            alternative_eta_minutes=best_alt_eta,
        )

        return RerouteResponse(
            token_id=token_id,
            reroute_recommended=decision.should_reroute,
            current_centre_id=current_centre.centre_id,
            current_centre_name=current_centre.name,
            current_eta_minutes=current_prediction.predicted_wait_minutes,
            alternative_centre_id=best_alt_id,
            alternative_centre_name=best_alt_name,
            alternative_eta_minutes=best_alt_eta,
            improvement_minutes=decision.improvement_minutes,
            improvement_pct=decision.improvement_pct,
            reason=decision.reason,
        )


recommendation_service = RecommendationService()