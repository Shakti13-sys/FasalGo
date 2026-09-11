from fastapi import APIRouter, HTTPException

from app.schemas.slot import SlotBooking, SlotCancel
from app.services.slot_service import slot_service


router = APIRouter(
    prefix="/slots",
    tags=["Slots"]
)


@router.get("/{centre_id}")
def get_available_slots(centre_id: str):
    return slot_service.get_available_slots(centre_id)


@router.post("/book")
def book_slot(request: SlotBooking):
    try:
        return slot_service.book_slot(request.slot_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{slot_id}")
def cancel_slot(slot_id: str):
    try:
        return slot_service.cancel_slot(slot_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))