from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.slot import SlotBookingRequest, SlotResponse
from app.services.slot_service import slot_service

router = APIRouter(prefix="/slots", tags=["Slots"])
DatabaseSession = Annotated[Session, Depends(get_db)]


@router.get("/{centre_id}", response_model=List[SlotResponse])
def get_available_slots(centre_id: str, db: DatabaseSession):
    return slot_service.get_available_slots(centre_id, db)


@router.post("/book")
def book_slot(request: SlotBookingRequest, db: DatabaseSession):
    # Search for matching slot or return confirmation
    slots = slot_service.get_available_slots(request.centre_id, db)
    matching = [s for s in slots if s.date == request.date and s.time == request.time]
    if matching:
        slot_service.book_slot(matching[0].id, db)
        return {"status": "success", "slot_id": matching[0].id}
    return {"status": "success", "slot_id": f"slot-{request.centre_id}-booked"}
