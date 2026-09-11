from datetime import datetime
from typing import Dict, Optional

from app.schemas.token import TokenResponse


class TokenRepository:
    def __init__(self):
        self._tokens: Dict[str, TokenResponse] = {}
        self._counters: Dict[str, int] = {}

    def generate_token(
        self,
        centre_id: str,
        slot_id: str
    ) -> TokenResponse:

        # Get the next token number for this centre
        next_number = self._counters.get(centre_id, 0) + 1
        self._counters[centre_id] = next_number

        token_id = f"TKN-{centre_id}-{next_number:04d}"

        token = TokenResponse(
            token_id=token_id,
            centre_id=centre_id,
            slot_id=slot_id,
            token_number=next_number,
            status="WAITING",
            booked_at=datetime.now(),
            estimated_wait_minutes=None,
        )

        self._tokens[token_id] = token

        return token

    def get_token(self, token_id: str) -> Optional[TokenResponse]:
        return self._tokens.get(token_id)


token_repository = TokenRepository()