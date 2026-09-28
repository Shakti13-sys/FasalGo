from typing import List, Optional
from sqlalchemy.orm import Session

from app.db.models import Slot
from app.db.session import SessionLocal
from app.schemas.slot import SlotResponse


class SlotRepository:
    def get_available_slots(self, centre_id: str, db: Optional[Session] = None) -> List[SlotResponse]:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            slots = (
                db.query(Slot)
                .filter(Slot.centre_id == centre_id, Slot.is_available == True)
                .all()
            )
            return [
                SlotResponse(
                    id=s.id,
                    centre_id=s.centre_id,
                    date=s.date,
                    time=s.time_label,
                    capacity=s.capacity,
                    booked_count=s.booked_count,
                    is_available=s.is_available,
                )
                for s in slots
            ]
        finally:
            if close_on_exit:
                db.close()

    def book_slot(self, slot_id: str, db: Optional[Session] = None) -> Slot:
        close_on_exit = False
        if db is None:
            db = SessionLocal()
            close_on_exit = True
        try:
            slot = db.query(Slot).filter(Slot.id == slot_id).first()
            if not slot:
                raise ValueError("Slot not found")
            if slot.booked_count >= slot.capacity:
                raise ValueError("Slot is already full")

            slot.booked_count += 1
            if slot.booked_count >= slot.capacity:
                slot.is_available = False
            db.commit()
            db.refresh(slot)
            return slot
        finally:
            if close_on_exit:
                db.close()


slot_repository = SlotRepository()
