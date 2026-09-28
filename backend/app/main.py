from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.base import Base
from app.db.seed import seed_database
from app.db.session import SessionLocal, engine
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.centres import router as centres_router
from app.routes.congestion import router as congestion_router
from app.routes.farmers import router as farmers_router
from app.routes.forecast import router as forecast_router
from app.routes.payment import router as payment_router
from app.routes.procurement import router as procurement_router
from app.routes.queue import router as queue_router
from app.routes.queue_ws import router as queue_ws_router
from app.routes.recommendations import router as recommendations_router
from app.routes.slots import router as slots_router
from app.routes.tokens import router as tokens_router
from app.routes.voice import router as voice_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed initial data
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "FasalGo: AI-Powered Smart Procurement & Real-Time Queue Intelligence Platform (SIH26032). "
        "Predicts waiting times, recommends procurement centres, manages live token queues with WebSockets, "
        "forecasts congestion, dynamic rerouting, bottleneck detection, and DBT payments."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

# Configure CORS
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Feature Routers
app.include_router(auth_router)
app.include_router(farmers_router)
app.include_router(centres_router)
app.include_router(recommendations_router)
app.include_router(slots_router)
app.include_router(tokens_router)
app.include_router(queue_router)
app.include_router(queue_ws_router)
app.include_router(congestion_router)
app.include_router(forecast_router)
app.include_router(procurement_router)
app.include_router(payment_router)
app.include_router(admin_router)
app.include_router(voice_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "realtime": True,
        "websocket": "/ws/queue/{centre_id}",
    }
