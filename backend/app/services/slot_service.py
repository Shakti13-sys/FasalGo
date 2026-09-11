from typing import List

from app.data.slot_repository import slot_repository
from app.schemas.slot import SlotResponse


class SlotService:

    def get_available_slots(self, centre_id: str) -> List[SlotResponse]:
        slots = slot_repository.get_by_centre(centre_id)

        return [
            slot
            for slot in slots
            if slot.is_available
        ]

    def book_slot(self, slot_id: str) -> SlotResponse:
        slot = slot_repository.book_slot(slot_id)

        if slot is None:
            raise ValueError("Slot not found or slot is full")

        return slot

    def cancel_slot(self, slot_id: str) -> SlotResponse:
        slot = slot_repository.cancel_slot(slot_id)

        if slot is None:
            raise ValueError("Slot not found")

        return slot


slot_service = SlotService()