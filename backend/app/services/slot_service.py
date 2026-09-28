from typing import List
from sqlalchemy.orm import Session

from app.data.slot_repository import slot_repository
from app.schemas.slot import SlotResponse


class SlotService:
    def get_available_slots(self, centre_id: str, db: Session) -> List[SlotResponse]:
        return slot_repository.get_available_slots(centre_id, db=db)

    def book_slot(self, slot_id: str, db: Session):
        return slot_repository.book_slot(slot_id, db=db)


slot_service = SlotService()
