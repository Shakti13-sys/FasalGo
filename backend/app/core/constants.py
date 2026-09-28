from enum import Enum


class UserRole(str, Enum):
    FARMER = "FARMER"
    ADMIN = "ADMIN"


class OperationalStatus(str, Enum):
    OPEN = "OPEN"
    PAUSED = "PAUSED"
    CLOSED = "CLOSED"


class CongestionLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TokenStatus(str, Enum):
    BOOKED = "booked"
    ARRIVED = "arrived"
    IN_QUEUE = "in-queue"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProcurementStageEnum(str, Enum):
    BOOKED = "booked"
    ARRIVED = "arrived"
    WEIGHING = "weighing"
    QUALITY_CHECK = "quality-check"
    ACCEPTED = "accepted"
    PROCURED = "procured"
    PAYMENT_PENDING = "payment-pending"
    PAID = "paid"


class PaymentStatusEnum(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class BottleneckSeverity(str, Enum):
    WARNING = "warning"
    CRITICAL = "critical"
