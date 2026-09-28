from fastapi import FastAPI

from app.routes.recommendations import router as recommendations_router
from app.routes.slots import router as slots_router
from app.routes.tokens import router as tokens_router
from app.routes.queue import router as queue_router
from app.routes.queue_ws import router as queue_ws_router

from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "SIH26032 Farmer Procurement Platform - Module 5: "
        "Procurement Intelligence Engine (recommendation, congestion, "
        "forecasting, and rerouting)."
    ),
    version="1.0.0",
)

app.include_router(recommendations_router)
app.include_router(slots_router)
app.include_router(tokens_router)
app.include_router(queue_router)
app.include_router(queue_ws_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "module": "M5 Procurement Intelligence Engine"}
