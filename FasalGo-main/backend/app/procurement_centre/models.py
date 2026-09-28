from sqlalchemy import Column, Integer, String, Float, Boolean
from database import Base


class ProcurementCentre(Base):
    __tablename__ = "procurement_centres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    working_hours = Column(String(100), nullable=False)

    total_counters = Column(Integer, default=0)
    active_counters = Column(Integer, default=0)

    average_processing_time = Column(Float, default=0.0)

    status = Column(String(30), default="ACTIVE")


class Counter(Base):
    __tablename__ = "counters"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, nullable=False)

    counter_number = Column(Integer, nullable=False)

    status = Column(String(30), default="ACTIVE")

    current_token = Column(Integer, default=0)

    average_processing_time = Column(Float, default=0.0)