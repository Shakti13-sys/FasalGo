from pydantic import BaseModel, ConfigDict


class BottleneckResponse(BaseModel):
    id: str
    centreId: str
    centreName: str
    counter: int
    processingTimeAboveNormal: int
    expectedDelay: int
    recommendedAction: str
    severity: str

    model_config = ConfigDict(from_attributes=True)


class BottleneckActionRequest(BaseModel):
    action: str = "apply"
