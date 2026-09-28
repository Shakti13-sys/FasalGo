from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.core.constants import PaymentStatusEnum, ProcurementStageEnum
from app.db.models import Payment, Procurement, ProcurementCentre, ProcurementStage, User
from app.schemas.procurement import ProcurementResponse, ProcurementStageDetail


class ProcurementService:
    def get_active_procurement(
        self, db: Session, user: Optional[User] = None
    ) -> ProcurementResponse:
        procurement = None
        if user:
            procurement = (
                db.query(Procurement)
                .filter(Procurement.user_id == user.id)
                .order_by(Procurement.id.desc())
                .first()
            )
        if not procurement:
            procurement = db.query(Procurement).first()

        if not procurement:
            # Fallback
            return self._build_default_response()

        centre = db.query(ProcurementCentre).filter(ProcurementCentre.id == procurement.centre_id).first()
        centre_name = centre.name if centre else "Centre A — Nashik Mandi"

        stages = (
            db.query(ProcurementStage)
            .filter(ProcurementStage.procurement_id == procurement.id)
            .order_by(ProcurementStage.order_idx)
            .all()
        )

        stage_details = [
            ProcurementStageDetail(
                stage=s.stage.value if hasattr(s.stage, "value") else str(s.stage),
                label=s.label,
                description=s.description,
                timestamp=s.timestamp or "—",
                completed=s.completed,
            )
            for s in stages
        ]

        return ProcurementResponse(
            id=procurement.id,
            procurementId=procurement.procurement_id,
            centreName=centre_name,
            crop=procurement.crop,
            quantity=procurement.quantity,
            unit=procurement.unit,
            amount=procurement.amount,
            status=procurement.status.value if hasattr(procurement.status, "value") else str(procurement.status),
            date=procurement.date,
            stages=stage_details,
        )

    def advance_stage(self, procurement_id: str, db: Session) -> ProcurementResponse:
        procurement = (
            db.query(Procurement)
            .filter(
                (Procurement.id == procurement_id)
                | (Procurement.procurement_id == procurement_id)
            )
            .first()
        )
        if not procurement:
            procurement = db.query(Procurement).first()
            if not procurement:
                raise ValueError("Procurement not found")

        stages = (
            db.query(ProcurementStage)
            .filter(ProcurementStage.procurement_id == procurement.id)
            .order_by(ProcurementStage.order_idx)
            .all()
        )

        # Find first uncompleted stage
        uncompleted = [s for s in stages if not s.completed]
        if uncompleted:
            now = datetime.now()
            time_str = now.strftime("%I:%M %p").lstrip("0")
            next_stage = uncompleted[0]
            next_stage.completed = True
            next_stage.timestamp = time_str
            procurement.status = next_stage.stage
            db.commit()

        return self.get_active_procurement(db)

    def _build_default_response(self) -> ProcurementResponse:
        stages_data = [
            ("booked", "Slot Booked", "Token #47 generated for Centre A", "9:30 AM", True),
            ("arrived", "Arrived at Centre", "Gate entry confirmed at Centre A", "10:15 AM", True),
            ("weighing", "Weighing Completed", "Gross weight: 85 Quintals verified", "10:45 AM", True),
            ("quality-check", "Quality Verification", "Grade A standard certified — moisture 11.2%", "11:15 AM", True),
            ("accepted", "Crop Accepted", "Procurement receipt issued (PRC-2026-0891)", "11:30 AM", True),
            ("procured", "Procurement Finalized", "Loaded into warehouse bay #4", "11:45 AM", True),
            ("payment-pending", "Payment Processing", "DBT transfer initiated to bank account", "12:00 PM", True),
            ("paid", "Payment Completed", "₹42,500 credited via DBT (Ref: TXN7845236901)", "4:06 PM", True),
        ]
        return ProcurementResponse(
            id="prc-default",
            procurementId="PRC-2026-0891",
            centreName="Centre A — Nashik Mandi",
            crop="Wheat",
            quantity=85.0,
            unit="Quintal",
            amount=42500.0,
            status="accepted",
            date="Today",
            stages=[
                ProcurementStageDetail(
                    stage=s[0], label=s[1], description=s[2], timestamp=s[3], completed=s[4]
                )
                for s in stages_data
            ],
        )


procurement_service = ProcurementService()
