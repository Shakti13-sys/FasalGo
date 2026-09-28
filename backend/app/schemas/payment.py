from pydantic import BaseModel, ConfigDict


class PaymentResponse(BaseModel):
    procurementId: str
    crop: str
    quantity: float
    amount: float
    status: str
    date: str
    transactionRef: str
    bankAccountHint: str = "•••• 4821 (SBI)"

    model_config = ConfigDict(from_attributes=True)
