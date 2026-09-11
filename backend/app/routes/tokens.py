from fastapi import APIRouter, HTTPException
from app.schemas.token import TokenGenerate
from app.services.token_service import token_service

router = APIRouter(prefix="/tokens", tags=["Tokens"])


@router.post("/generate")
async def generate_token(request: TokenGenerate):
    try:
        return await token_service.generate_token(
            centre_id=request.centre_id,
            slot_id=request.slot_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{token_id}")
def get_token(token_id: str):
    try:
        return token_service.get_token(token_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))