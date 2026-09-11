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
    booked_at_eta_minutes: float


class QueueDataProvider(ABC):

    @abstractmethod
    def get_queue_state(self, centre_id: str) -> QueueState:
        raise NotImplementedError

    @abstractmethod
    def get_token_info(self, token_id: str) -> TokenInfo:
        raise NotImplementedError


class StubQueueDataProvider(QueueDataProvider):

    # ---------------------------------------------------------------
    # Get LIVE queue information from M3
    # ---------------------------------------------------------------
    def get_queue_state(self, centre_id: str) -> QueueState:

        from app.data.centre_repository import centre_repository
        from app.data.queue_repository import queue_repository

        centre = centre_repository.get(centre_id)

        if centre is None:
            raise ValueError(
                f"Unknown centre_id: {centre_id}"
            )

        # Get dynamic queue data from M3
        queue = queue_repository.get_queue(
            centre_id
        )

        if queue is None:
            raise ValueError(
                f"Queue not found for centre_id: {centre_id}"
            )

        return QueueState(
            centre_id=queue.centre_id,

            # LIVE M3 queue length
            queue_length=queue.queue_length,

            # LIVE active counters
            active_counters=queue.active_counters,

            # For centre-level prediction, queue length
            # represents farmers currently ahead.
            farmers_ahead=queue.queue_length,

            current_serving_token=(
                queue.current_serving_token
            ),

            operational_status=centre.operational_status,
        )

    # ---------------------------------------------------------------
    # Get token information
    # ---------------------------------------------------------------
    def get_token_info(
        self,
        token_id: str
    ) -> TokenInfo:

        from app.data.centre_repository import centre_repository
        from app.data.token_repository import token_repository

        # First check whether token actually exists
        token = token_repository.get_token(
            token_id
        )

        if token is None:
            raise ValueError(
                f"Token not found: {token_id}"
            )

        centre_id = token.centre_id

        centre = centre_repository.get(
            centre_id
        )

        if centre is None:
            raise ValueError(
                f"Token references unknown centre_id: {centre_id}"
            )

        return TokenInfo(
            token_id=token_id,
            centre_id=centre_id,

            # Demo farmer location near the centre
            farmer_lat=(
                centre.coordinates.latitude + 0.01
            ),

            farmer_lon=(
                centre.coordinates.longitude + 0.01
            ),

            # Existing ETA assumption
            booked_at_eta_minutes=25.0,
        )


_provider_instance: QueueDataProvider = (
    StubQueueDataProvider()
)


def get_queue_data_provider() -> QueueDataProvider:
    return _provider_instance