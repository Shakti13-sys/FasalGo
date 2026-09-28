from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.db.models import ProcurementCentre, Token
from app.db.session import SessionLocal
from app.intelligence.congestion import classify_congestion, compute_congestion_index
from app.schemas.common import CentreSnapshot
from app.schemas.queue import LiveQueueResponse, WaitTimePredictionResponse


class QueueRepository:
    def __init__(self):
        # In-memory tracking for live serving tokens per centre
        self.serving_tokens: Dict[str, int] = {
            "c1": 32,
            "c2": 18,
            "c3": 14,
            "c4": 42,
            "c5": 20,
        }
        # In-memory queue overrides (for spike simulations or live adjustments)
        self.queue_overrides: Dict[str, int] = {}

    def get_currently_serving(self, centre_id: str) -> int:
        return self.serving_tokens.get(centre_id, 32)

    def advance_queue(self, centre_id: str, increment: int = 1) -> int:
        curr = self.serving_tokens.get(centre_id, 32)
        new_val = curr + increment
        self.serving_tokens[centre_id] = new_val
        return new_val

    def set_queue_override(self, centre_id: str, queue_len: int):
        self.queue_overrides[centre_id] = queue_len

    def get_queue(self, centre_id: str, db: Optional[Session] = None) -> LiveQueueResponse:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
            if not centre:
                raise ValueError(f"Centre not found: {centre_id}")

            serving = self.get_currently_serving(centre_id)

            # Query real tokens in queue
            in_queue_tokens = (
                db.query(Token)
                .filter(Token.centre_id == centre_id, Token.status == "in-queue")
                .all()
            )

            # Fallback realistic baseline if empty
            default_base = {"c1": 21, "c2": 28, "c3": 35, "c4": 12, "c5": 24}.get(centre_id, 15)
            q_len = self.queue_overrides.get(centre_id, max(len(in_queue_tokens), default_base))

            active_counters = max(centre.active_counters, 1)
            avg_wait = int(round((q_len / active_counters) * centre.avg_processing_time_minutes))

            from app.data.centre_repository import centre_repository
            snapshot = centre_repository.get(centre_id, db=db)
            if snapshot:
                snapshot.queue_length = q_len
                idx = compute_congestion_index(snapshot)
                level = classify_congestion(idx).value.lower()
            else:
                level = "low" if avg_wait < 20 else "medium" if avg_wait < 40 else "high"

            token_nums = [t.token_number for t in in_queue_tokens]
            if not token_nums:
                token_nums = list(range(serving + 1, serving + q_len + 1))

            return LiveQueueResponse(
                centre_id=centre.id,
                centre_name=centre.name,
                currently_serving=serving,
                queue_length=q_len,
                active_counters=centre.active_counters,
                total_counters=centre.total_counters,
                avg_wait_minutes=avg_wait,
                congestion_level=level,
                tokens_in_queue=token_nums,
            )
        finally:
            if close_on_exit:
                db.close()

    def get_token_prediction(
        self, token_number: int, centre_id: str = "c1", db: Optional[Session] = None
    ) -> WaitTimePredictionResponse:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
            proc_time = centre.avg_processing_time_minutes if centre else 6.0
            active_counters = max(centre.active_counters if centre else 3, 1)

            serving = self.get_currently_serving(centre_id)
            farmers_ahead = max(0, token_number - serving)
            estimated_wait = max(3, int(round((farmers_ahead / active_counters) * proc_time)))

            now = datetime.now()
            turn_minutes = now.minute + estimated_wait
            turn_hour = (now.hour + (turn_minutes // 60)) % 24
            turn_min = turn_minutes % 60
            ampm = "PM" if turn_hour >= 12 else "AM"
            display_hour = turn_hour - 12 if turn_hour > 12 else (12 if turn_hour == 0 else turn_hour)
            estimated_turn = f"{display_hour}:{turn_min:02d} {ampm}"

            confidence = max(72, min(95, 95 - int(farmers_ahead * 0.8)))
            status = "ahead" if estimated_wait < 20 else ("delayed" if estimated_wait > 35 else "on-track")

            return WaitTimePredictionResponse(
                token=token_number,
                currentlyServing=serving,
                farmersAhead=farmers_ahead,
                estimatedWait=estimated_wait,
                estimatedTurn=estimated_turn,
                confidence=confidence,
                status=status,
            )
        finally:
            if close_on_exit:
                db.close()


queue_repository = QueueRepository()
