from typing import Optional

from pydantic import BaseModel


class QueueResponse(BaseModel):
    centre_id: str
    queue_length: int
    active_counters: int
    current_serving_token: Optional[str] = None
    queue_status: str


class TokenQueueResponse(BaseModel):
    token_id: str
    centre_id: str
    token_number: int
    farmers_ahead: int
    queue_length: int
    current_serving_token: Optional[str] = None
    queue_status: str
    estimated_wait_minutes: Optional[float] = None