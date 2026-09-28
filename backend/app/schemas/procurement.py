from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.core.constants import ProcurementStageEnum


class ProcurementStageDetail(BaseModel):
    stage: str
    label: str
    description: str
    timestamp: Optional[str] = "—"
    completed: bool = False

    model_config = ConfigDict(from_attributes=True)


class ProcurementResponse(BaseModel):
    id: str
    procurementId: str
    centreName: str
    crop: str
    quantity: float
    unit: str
    amount: float
    status: str
    date: str
    stages: List[ProcurementStageDetail]

    model_config = ConfigDict(from_attributes=True)
