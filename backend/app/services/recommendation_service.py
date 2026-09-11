from datetime import datetime, timezone
from typing import List, Optional

from app.core.config import settings
from app.core.constants import OperationalStatus
from app.data.centre_repository import centre_repository

from app.integrations.m3_client import get_queue_data_provider
from app.integrations.m4_client import (
    QueueInput,
    get_wait_time_predictor,
)

from app.intelligence.best_time import recommend_best_times
from app.intelligence.congestion import (
    classify_congestion,
    compute_congestion_index,
    congestion_explanation,
)
from app.intelligence.distance import haversine_km
from app.intelligence.forecast import forecast_next_hours
from app.intelligence.rerouting import evaluate_reroute
from app.intelligence.scoring import build_reason, compute_score

from app.schemas.common import CentreSnapshot
from app.schemas.recommendation import (
    BestTimeResponse,
    CentreRecommendation,
    CongestionResponse,
    ForecastResponse,
    RecommendationFactors,
    RerouteResponse,
)


class RecommendationService:

    def __init__(self):
        self.wait_time_predictor = get_wait_time_predictor()
        self.queue_provider = get_queue_data_provider()

    # ------------------------------------------------------------------
    # Helper: Get live M3 queue data for a centre
    # ------------------------------------------------------------------
    def _get_queue_input(self, centre_id: str) -> QueueInput:

        queue_state = self.queue_provider.get_queue_state(centre_id)

        return QueueInput(
            queue_length=queue_state.queue_length,
            farmers_ahead=queue_state.farmers_ahead,
            active_counters=queue_state.active_counters,
        )

    # ------------------------------------------------------------------
    # 1 & 2: Smart centre recommendation + explainability
    # ------------------------------------------------------------------
    def recommend_centres(
        self,
        farmer_lat: float,
        farmer_lon: float,
        at_time: Optional[datetime] = None,
    ) -> List[CentreRecommendation]:

        at_time = at_time or datetime.now(timezone.utc)

        centres = centre_repository.list_nearby(
            farmer_lat,
            farmer_lon,
            max_km=settings.MAX_REASONABLE_DISTANCE_KM,
        )

        centres = [
            c
            for c in centres
            if c.operational_status == OperationalStatus.OPEN
        ]

        if not centres:
            return []

        scored: List[tuple] = []

        for centre in centres:

            distance_km = haversine_km(
                farmer_lat,
                farmer_lon,
                centre.coordinates.latitude,
                centre.coordinates.longitude,
            )

            # Get live queue data from M3
            queue_data = self._get_queue_input(
                centre.centre_id
            )

            # Send M3 queue data to M4
            prediction = self.wait_time_predictor.predict(
                centre.centre_id,
                farmer_lat,
                farmer_lon,
                at_time,
                queue_data,
            )

            congestion_index = compute_congestion_index(
                centre
            )

            level = classify_congestion(
                congestion_index
            )

            breakdown = compute_score(
                distance_km=distance_km,
                predicted_wait_minutes=prediction.predicted_wait_minutes,
                congestion_index=congestion_index,
                active_counters=queue_data.active_counters,
                total_counters=centre.total_counters,
            )

            scored.append(
                (
                    centre,
                    distance_km,
                    prediction,
                    congestion_index,
                    level,
                    breakdown,
                )
            )

        # Rank by score
        scored.sort(
            key=lambda x: x[5].score,
            reverse=True,
        )

        # Nearest centre
        nearest_entry = min(
            scored,
            key=lambda x: x[1],
        )

        results: List[CentreRecommendation] = []

        for rank, (
            centre,
            distance_km,
            prediction,
            congestion_index,
            level,
            breakdown,
        ) in enumerate(scored, start=1):

            is_top = rank == 1

            comparison_name = None
            comparison_wait = None

            if (
                is_top
                and nearest_entry[0].centre_id
                != centre.centre_id
            ):
                comparison_name = nearest_entry[0].name
                comparison_wait = (
                    nearest_entry[2]
                    .predicted_wait_minutes
                )

            reason = build_reason(
                centre_name=centre.name,
                distance_km=distance_km,
                predicted_wait_minutes=prediction.predicted_wait_minutes,
                is_top_choice=is_top,
                comparison_centre_name=comparison_name,
                comparison_wait=comparison_wait,
            )

            # Get live queue information
            queue_data = self._get_queue_input(
                centre.centre_id
            )

            results.append(
                CentreRecommendation(
                    centre_id=centre.centre_id,
                    centre_name=centre.name,
                    score=breakdown.score,
                    rank=rank,
                    factors=RecommendationFactors(
                        distance_km=distance_km,
                        predicted_wait_minutes=prediction.predicted_wait_minutes,
                        eta_minutes=prediction.eta_minutes,
                        prediction_confidence=prediction.confidence,

                        # M3 live queue data
                        queue_length=queue_data.queue_length,
                        active_counters=queue_data.active_counters,

                        congestion_level=level,
                        congestion_index=congestion_index,
                    ),
                    reason=reason,
                )
            )

        return results

    # ------------------------------------------------------------------
    # 3: Best time to visit
    # ------------------------------------------------------------------
    def best_time(
        self,
        centre_id: str,
        at_time: Optional[datetime] = None,
    ) -> BestTimeResponse:

        centre = self._get_centre_or_raise(
            centre_id
        )

        at_time = at_time or datetime.now(
            timezone.utc
        )

        slots = recommend_best_times(
            centre,
            at_time,
            settings.FORECAST_HORIZON_HOURS,
        )

        return BestTimeResponse(
            centre_id=centre.centre_id,
            centre_name=centre.name,
            best_slots=slots,
        )

    # ------------------------------------------------------------------
    # 4: Congestion detection
    # ------------------------------------------------------------------
    def get_congestion(
        self,
        centre_id: str,
    ) -> CongestionResponse:

        centre = self._get_centre_or_raise(
            centre_id
        )

        # Get live M3 queue data
        queue_data = self._get_queue_input(
            centre_id
        )

        index = compute_congestion_index(
            centre
        )

        level = classify_congestion(
            index
        )

        utilization_pct = round(
            (
                queue_data.queue_length
                / max(centre.capacity, 1)
            ) * 100,
            1,
        )

        return CongestionResponse(
            centre_id=centre.centre_id,
            centre_name=centre.name,
            congestion_level=level,
            congestion_index=index,

            # M3 live queue
            queue_length=queue_data.queue_length,
            active_counters=queue_data.active_counters,

            utilization_pct=utilization_pct,
            explanation=congestion_explanation(
                centre,
                index,
                level,
            ),
        )

    # ------------------------------------------------------------------
    # 5: Future congestion forecast
    # ------------------------------------------------------------------
    def get_forecast(
        self,
        centre_id: str,
        at_time: Optional[datetime] = None,
    ) -> ForecastResponse:

        centre = self._get_centre_or_raise(
            centre_id
        )

        at_time = at_time or datetime.now(
            timezone.utc
        )

        points = forecast_next_hours(
            centre,
            at_time,
            settings.FORECAST_HORIZON_HOURS,
        )

        return ForecastResponse(
            centre_id=centre.centre_id,
            centre_name=centre.name,
            horizon_hours=settings.FORECAST_HORIZON_HOURS,
            forecast=points,
        )

    # ------------------------------------------------------------------
    # 6: Dynamic rerouting
    # ------------------------------------------------------------------
    def evaluate_reroute_for_token(
        self,
        token_id: str,
        at_time: Optional[datetime] = None,
    ) -> RerouteResponse:

        at_time = at_time or datetime.now(
            timezone.utc
        )

        token_info = self.queue_provider.get_token_info(
            token_id
        )

        current_centre = self._get_centre_or_raise(
            token_info.centre_id
        )

        # Get live M3 queue data for current centre
        current_queue = self._get_queue_input(
            current_centre.centre_id
        )

        current_prediction = (
            self.wait_time_predictor.predict(
                current_centre.centre_id,
                token_info.farmer_lat,
                token_info.farmer_lon,
                at_time,
                current_queue,
            )
        )

        nearby = centre_repository.list_nearby(
            token_info.farmer_lat,
            token_info.farmer_lon,
            max_km=settings.MAX_REASONABLE_DISTANCE_KM,
        )

        alternatives = [
            c
            for c in nearby
            if (
                c.centre_id
                != current_centre.centre_id
                and c.operational_status
                == OperationalStatus.OPEN
            )
        ]

        best_alt_centre_id = None
        best_alt_eta = None

        if alternatives:

            alternative_predictions = []

            for alt in alternatives:

                # Get live M3 queue data
                alt_queue = self._get_queue_input(
                    alt.centre_id
                )

                prediction = (
                    self.wait_time_predictor.predict(
                        alt.centre_id,
                        token_info.farmer_lat,
                        token_info.farmer_lon,
                        at_time,
                        alt_queue,
                    )
                )

                alternative_predictions.append(
                    (
                        alt,
                        prediction.eta_minutes,
                    )
                )

            best_alt = min(
                alternative_predictions,
                key=lambda item: item[1],
            )

            best_alt_centre_id = (
                best_alt[0].centre_id
            )

            best_alt_eta = best_alt[1]

        decision = evaluate_reroute(
            current_centre_id=current_centre.centre_id,
            current_live_eta_minutes=current_prediction.eta_minutes,
            booked_at_eta_minutes=token_info.booked_at_eta_minutes,
            alternative_centre_id=best_alt_centre_id,
            alternative_eta_minutes=best_alt_eta,
        )

        return RerouteResponse(
            token_id=token_id,
            reroute_recommended=decision.should_reroute,
            current_centre_id=current_centre.centre_id,
            current_eta_minutes=current_prediction.eta_minutes,
            alternative_centre_id=best_alt_centre_id,
            alternative_eta_minutes=best_alt_eta,
            improvement_minutes=decision.improvement_minutes,
            improvement_pct=decision.improvement_pct,
            reason=decision.reason,
        )

    # ------------------------------------------------------------------
    # Centre helper
    # ------------------------------------------------------------------
    def _get_centre_or_raise(
        self,
        centre_id: str,
    ) -> CentreSnapshot:

        centre = centre_repository.get(
            centre_id
        )

        if centre is None:
            raise ValueError(
                f"Centre not found: {centre_id}"
            )

        return centre


recommendation_service = RecommendationService()