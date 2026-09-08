from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from app.core.constants import OperationalStatus


@dataclass
class QueueState:
    centre_id: str
    queue_length: int
    active_counters: int
    farmers_ahead: int
    current_serving_token: Optional[str]
    operational_status: OperationalStatus


@dataclass
class TokenInfo:
    token_id: str
    centre_id: str
    farmer_lat: float
    farmer_lon: float
    booked_at_eta_minutes: float  # ETA 


class QueueDataProvider(ABC):
    @abstractmethod
    def get_queue_state(self, centre_id: str) -> QueueState:
        raise NotImplementedError

    @abstractmethod
    def get_token_info(self, token_id: str) -> TokenInfo:
        raise NotImplementedError


class StubQueueDataProvider(QueueDataProvider):
    def get_queue_state(self, centre_id: str) -> QueueState:
        from app.data.centre_repository import centre_repository

        centre = centre_repository.get(centre_id)
        if centre is None:
            raise ValueError(f"Unknown centre_id: {centre_id}")

        return QueueState(
            centre_id=centre_id,
            queue_length=centre.queue_length,
            active_counters=centre.active_counters,
            farmers_ahead=centre.queue_length,
            current_serving_token=f"TKN-{centre_id}-{centre.queue_length:04d}",
            operational_status=centre.operational_status,
        )

    def get_token_info(self, token_id: str) -> TokenInfo:
        from app.data.centre_repository import centre_repository

        # Synthetic parsing: token format is TKN-{centre_id}-{seq}, and we
        parts = token_id.split("-")
        if len(parts) < 2:
            raise ValueError(f"Malformed token_id: {token_id}")
        centre_id = parts[1]
        centre = centre_repository.get(centre_id)
        if centre is None:
            raise ValueError(f"Token references unknown centre_id: {centre_id}")

        return TokenInfo(
            token_id=token_id,
            centre_id=centre_id,
            farmer_lat=centre.coordinates.latitude + 0.01,
            farmer_lon=centre.coordinates.longitude + 0.01,
            booked_at_eta_minutes=25.0,  # assumption: documented in README
        )


_provider_instance: QueueDataProvider = StubQueueDataProvider()


def get_queue_data_provider() -> QueueDataProvider:
    return _provider_instance
