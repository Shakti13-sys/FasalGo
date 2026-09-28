from __future__ import annotations
from datetime import datetime
from typing import Any, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import (
    BottleneckSeverity,
    CongestionLevel,
    OperationalStatus,
    PaymentStatusEnum,
    ProcurementStageEnum,
    TokenStatus,
    UserRole,
)
from app.db.base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_mobile", "mobile"),
        Index("ix_users_role", "role"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[UserRole] = mapped_column(String(20), nullable=False, default=UserRole.FARMER)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    farmer_profile: Mapped[Optional[FarmerProfile]] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    tokens: Mapped[List[Token]] = relationship(back_populates="user", cascade="all, delete-orphan")
    procurements: Mapped[List[Procurement]] = relationship(back_populates="user", cascade="all, delete-orphan")
    payments: Mapped[List[Payment]] = relationship(back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List[Notification]] = relationship(back_populates="user", cascade="all, delete-orphan")
    audit_logs: Mapped[List[AuditLog]] = relationship(back_populates="user", cascade="all, delete-orphan")


class FarmerProfile(TimestampMixin, Base):
    __tablename__ = "farmer_profiles"
    __table_args__ = (Index("ix_farmer_profiles_state_district", "state", "district"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    crop: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, default="Wheat")
    quantity: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=85.0)
    state: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, default="Maharashtra")
    district: Mapped[Optional[str]] = mapped_column(String(120), nullable=True, default="Nashik")
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, default="Panchavati")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=19.9975)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=73.7898)

    user: Mapped[User] = relationship(back_populates="farmer_profile")


class ProcurementCentre(TimestampMixin, Base):
    __tablename__ = "procurement_centres"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g. "c1", "C001"
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    active_counters: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    total_counters: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    avg_processing_time_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=6.0)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=50)  # farmers per hour
    processing_speed: Mapped[int] = mapped_column(Integer, nullable=False, default=30)  # farmers per hour
    operational_status: Mapped[OperationalStatus] = mapped_column(
        String(20), nullable=False, default=OperationalStatus.OPEN
    )
    address: Mapped[str] = mapped_column(String(300), nullable=False)

    slots: Mapped[List[Slot]] = relationship(back_populates="centre", cascade="all, delete-orphan")
    tokens: Mapped[List[Token]] = relationship(back_populates="centre", cascade="all, delete-orphan")
    bottlenecks: Mapped[List[Bottleneck]] = relationship(back_populates="centre", cascade="all, delete-orphan")


class Slot(TimestampMixin, Base):
    __tablename__ = "slots"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)  # e.g. "slot-c1-today-1000"
    centre_id: Mapped[str] = mapped_column(
        ForeignKey("procurement_centres.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[str] = mapped_column(String(50), nullable=False)  # "Today", "Tomorrow", "2026-09-14"
    time_label: Mapped[str] = mapped_column(String(50), nullable=False)  # "10:00 AM", "4:00 PM"
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=20)
    booked_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    centre: Mapped[ProcurementCentre] = relationship(back_populates="slots")
    tokens: Mapped[List[Token]] = relationship(back_populates="slot")


class Token(TimestampMixin, Base):
    __tablename__ = "tokens"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)  # e.g. "TKN-c1-0047"
    token_number: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 47
    token_code: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "#47"
    centre_id: Mapped[str] = mapped_column(
        ForeignKey("procurement_centres.id", ondelete="CASCADE"), nullable=False
    )
    slot_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("slots.id", ondelete="SET NULL"), nullable=True
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    crop: Mapped[str] = mapped_column(String(100), nullable=False, default="Wheat")
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    status: Mapped[TokenStatus] = mapped_column(String(30), nullable=False, default=TokenStatus.BOOKED)
    date: Mapped[str] = mapped_column(String(50), nullable=False, default="Today")
    time: Mapped[str] = mapped_column(String(50), nullable=False, default="10:00 AM")
    booked_at_eta_minutes: Mapped[float] = mapped_column(Float, nullable=False, default=25.0)

    centre: Mapped[ProcurementCentre] = relationship(back_populates="tokens")
    slot: Mapped[Optional[Slot]] = relationship(back_populates="tokens")
    user: Mapped[Optional[User]] = relationship(back_populates="tokens")
    procurements: Mapped[List[Procurement]] = relationship(back_populates="token")


class Procurement(TimestampMixin, Base):
    __tablename__ = "procurements"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)  # "PRC-2026-0891"
    procurement_id: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    token_id: Mapped[Optional[str]] = mapped_column(ForeignKey("tokens.id"), nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    centre_id: Mapped[str] = mapped_column(ForeignKey("procurement_centres.id"), nullable=False)
    crop: Mapped[str] = mapped_column(String(100), nullable=False, default="Wheat")
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    unit: Mapped[str] = mapped_column(String(20), nullable=False, default="Quintal")
    rate_per_unit: Mapped[float] = mapped_column(Float, nullable=False, default=500.0)
    amount: Mapped[float] = mapped_column(Float, nullable=False, default=42500.0)
    status: Mapped[ProcurementStageEnum] = mapped_column(
        String(30), nullable=False, default=ProcurementStageEnum.ACCEPTED
    )
    date: Mapped[str] = mapped_column(String(50), nullable=False, default="Today")

    user: Mapped[User] = relationship(back_populates="procurements")
    token: Mapped[Optional[Token]] = relationship(back_populates="procurements")
    stages: Mapped[List[ProcurementStage]] = relationship(
        back_populates="procurement", cascade="all, delete-orphan", order_by="ProcurementStage.order_idx"
    )
    payments: Mapped[List[Payment]] = relationship(back_populates="procurement", cascade="all, delete-orphan")


class ProcurementStage(Base):
    __tablename__ = "procurement_stages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    procurement_id: Mapped[str] = mapped_column(
        ForeignKey("procurements.id", ondelete="CASCADE"), nullable=False
    )
    stage: Mapped[ProcurementStageEnum] = mapped_column(String(30), nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    timestamp: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    order_idx: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    procurement: Mapped[Procurement] = relationship(back_populates="stages")


class Payment(TimestampMixin, Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    procurement_id: Mapped[str] = mapped_column(
        ForeignKey("procurements.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    crop: Mapped[str] = mapped_column(String(100), nullable=False, default="Wheat")
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=85.0)
    amount: Mapped[float] = mapped_column(Float, nullable=False, default=42500.0)
    status: Mapped[PaymentStatusEnum] = mapped_column(
        String(20), nullable=False, default=PaymentStatusEnum.COMPLETED
    )
    date: Mapped[str] = mapped_column(String(50), nullable=False, default="Today, 4:06 PM")
    transaction_ref: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    bank_account_hint: Mapped[str] = mapped_column(String(50), nullable=False, default="•••• 4821 (SBI)")

    user: Mapped[User] = relationship(back_populates="payments")
    procurement: Mapped[Procurement] = relationship(back_populates="payments")


class Bottleneck(TimestampMixin, Base):
    __tablename__ = "bottlenecks"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    centre_id: Mapped[str] = mapped_column(
        ForeignKey("procurement_centres.id", ondelete="CASCADE"), nullable=False
    )
    counter: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    processing_time_above_normal: Mapped[int] = mapped_column(Integer, nullable=False, default=35)
    expected_delay: Mapped[int] = mapped_column(Integer, nullable=False, default=18)
    recommended_action: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[BottleneckSeverity] = mapped_column(
        String(20), nullable=False, default=BottleneckSeverity.WARNING
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    centre: Mapped[ProcurementCentre] = relationship(back_populates="bottlenecks")


class Notification(TimestampMixin, Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False, default="system")
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(50), nullable=False, default="Just now")
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped[User] = relationship(back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_user_id_timestamp", "user_id", "timestamp"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    metadata_: Mapped[Optional[dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)

    user: Mapped[User] = relationship(back_populates="audit_logs")
