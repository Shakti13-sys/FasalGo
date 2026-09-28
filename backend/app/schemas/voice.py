from typing import Optional
from pydantic import BaseModel


class VoiceQueryRequest(BaseModel):
    query: str
    token_id: Optional[str] = None
    farmer_lat: Optional[float] = None
    farmer_lon: Optional[float] = None


class VoiceQueryResponse(BaseModel):
    query: str
    response: str
    action: Optional[str] = None
