from typing import Dict, List, Optional

from app.schemas.slot import SlotCreate, SlotResponse


class SlotRepository:
    def __init__(self):
        self._slots: Dict[str, SlotResponse] = {}
        self._create_demo_slots()

    def _create_demo_slots(self):
        demo_slots = [
            ("S001", "C001", 10, 20),
            ("S002", "C001", 11, 20),
            ("S003", "C001", 12, 20),
            ("S004", "C002", 10, 15),
            ("S005", "C002", 11, 15),
            ("S006", "C003", 10, 25),
            ("S007", "C003", 11, 25),
        ]

        for slot_id, centre_id, hour, capacity in demo_slots:
            from datetime import datetime

            slot = SlotResponse(
                slot_id=slot_id,
                centre_id=centre_id,
                slot_time=datetime.now().replace(
                    hour=hour,
                    minute=0,
                    second=0,
                    microsecond=0
                ),
                capacity=capacity,
                booked_count=0,
                available_capacity=capacity,
                is_available=True,
            )

            self._slots[slot_id] = slot

    def get_by_id(self, slot_id: str) -> Optional[SlotResponse]:
        return self._slots.get(slot_id)

    def get_by_centre(self, centre_id: str) -> List[SlotResponse]:
        return [
            slot
            for slot in self._slots.values()
            if slot.centre_id == centre_id
        ]

    def book_slot(self, slot_id: str) -> Optional[SlotResponse]:
        slot = self._slots.get(slot_id)

        if slot is None:
            return None

        if slot.booked_count >= slot.capacity:
            return None

        slot.booked_count += 1
        slot.available_capacity = slot.capacity - slot.booked_count
        slot.is_available = slot.available_capacity > 0

        return slot

    def cancel_slot(self, slot_id: str) -> Optional[SlotResponse]:
        slot = self._slots.get(slot_id)

        if slot is None:
            return None

        if slot.booked_count > 0:
            slot.booked_count -= 1

        slot.available_capacity = slot.capacity - slot.booked_count
        slot.is_available = slot.available_capacity > 0

        return slot


slot_repository = SlotRepository()