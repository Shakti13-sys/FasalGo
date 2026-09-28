from pydantic import BaseModel
from typing import Optional


class CentreCreate(BaseModel):
    name: str
    address: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    working_hours: str
    total_counters: int = 0


class CentreUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    working_hours: Optional[str] = None
    total_counters: Optional[int] = None
    active_counters: Optional[int] = None
    status: Optional[str] = None


class CentreResponse(BaseModel):
    id: int
    name: str
    address: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    working_hours: str
    total_counters: int
    active_counters: int
    average_processing_time: float
    status: str

    class Config:
        from_attributes = True


class CounterCreate(BaseModel):
    centre_id: int
    counter_number: int


class CounterUpdate(BaseModel):
    status: Optional[str] = None
    current_token: Optional[int] = None
    average_processing_time: Optional[float] = None


class CounterResponse(BaseModel):
    id: int
    centre_id: int
    counter_number: int
    status: str
    current_token: int
    average_processing_time: float

    class Config:
        from_attributes = True