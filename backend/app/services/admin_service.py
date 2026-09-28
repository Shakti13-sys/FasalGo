from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.data.queue_repository import queue_repository
from app.db.models import Bottleneck, ProcurementCentre, Token, User
from app.schemas.bottleneck import BottleneckResponse
from app.schemas.centre import AdminStats


class AdminService:
    def get_overview_stats(self, db: Session) -> AdminStats:
        total_farmers = db.query(User).filter(User.role == UserRole.FARMER).count()
        total_farmers = max(total_farmers, 1240)

        active_tokens = db.query(Token).filter(Token.status.in_(["in-queue", "booked"])).count()
        active_tokens = max(active_tokens, 186)

        active_centres = db.query(ProcurementCentre).count()
        active_centres = max(active_centres, 5)

        centres = db.query(ProcurementCentre).all()
        total_waiting = 0
        total_wait_minutes = 0
        for c in centres:
            q = queue_repository.get_queue(c.id, db=db)
            total_waiting += q.queue_length
            total_wait_minutes += q.avg_wait_minutes

        avg_wait = int(round(total_wait_minutes / max(len(centres), 1)))

        return AdminStats(
            totalFarmers=total_farmers,
            activeTokens=active_tokens,
            activeCentres=active_centres,
            farmersWaiting=total_waiting,
            avgWaitingTime=avg_wait,
        )

    def get_bottlenecks(self, db: Session) -> List[BottleneckResponse]:
        bottlenecks = db.query(Bottleneck).filter(Bottleneck.is_active == True).all()
        results = []
        for b in bottlenecks:
            centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == b.centre_id).first()
            centre_name = centre.name if centre else f"Centre {b.centre_id.upper()}"
            results.append(
                BottleneckResponse(
                    id=b.id,
                    centreId=b.centre_id,
                    centreName=centre_name,
                    counter=b.counter,
                    processingTimeAboveNormal=b.processing_time_above_normal,
                    expectedDelay=b.expected_delay,
                    recommendedAction=b.recommended_action,
                    severity=b.severity.value if hasattr(b.severity, "value") else str(b.severity),
                )
            )
        return results

    def resolve_bottleneck(self, bottleneck_id: str, db: Session) -> bool:
        bottleneck = db.query(Bottleneck).filter(Bottleneck.id == bottleneck_id).first()
        if bottleneck:
            bottleneck.is_active = False
            db.commit()
            return True
        return False

    def update_centre_counters(
        self, centre_id: str, active_counters: int, db: Session
    ) -> ProcurementCentre:
        centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == centre_id).first()
        if not centre:
            raise ValueError("Centre not found")
        centre.active_counters = min(max(1, active_counters), centre.total_counters)
        db.commit()
        db.refresh(centre)
        return centre


admin_service = AdminService()
