from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import Payment, User
from app.schemas.payment import PaymentResponse


class PaymentService:
    def get_payment_info(self, db: Session, user: Optional[User] = None) -> PaymentResponse:
        payment = None
        if user:
            payment = (
                db.query(Payment)
                .filter(Payment.user_id == user.id)
                .order_by(Payment.id.desc())
                .first()
            )
        if not payment:
            payment = db.query(Payment).first()

        if not payment:
            return PaymentResponse(
                procurementId="PRC-2026-0891",
                crop="Wheat",
                quantity=85.0,
                amount=42500.0,
                status="completed",
                date="Today, 4:06 PM",
                transactionRef="TXN7845236901",
                bankAccountHint="•••• 4821 (SBI)",
            )

        return PaymentResponse(
            procurementId=payment.procurement_id,
            crop=payment.crop,
            quantity=payment.quantity,
            amount=payment.amount,
            status=payment.status.value if hasattr(payment.status, "value") else str(payment.status),
            date=payment.date,
            transactionRef=payment.transaction_ref,
            bankAccountHint=payment.bank_account_hint,
        )


payment_service = PaymentService()
