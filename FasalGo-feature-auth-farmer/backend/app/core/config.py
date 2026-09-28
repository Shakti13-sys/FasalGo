from typing import Dict
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "M5 Procurement Intelligence Engine"
    ENV: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sih_farmer_procurement"

    # Authentication. Set M5_JWT_SECRET_KEY in production.
    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Recommendation scoring weights (must sum to 1.0)
    SCORE_WEIGHTS: Dict[str, float] = {
        "wait_time": 0.40,
        "distance": 0.25,
        "congestion": 0.20,
        "availability": 0.15,  # Active counters vs capacity
    }

    # Normalization caps (values beyond these are clamped to worst-case)
    MAX_REASONABLE_DISTANCE_KM: float = 25.0
    MAX_REASONABLE_WAIT_MINUTES: float = 180.0

    # Congestion thresholds on congestion_index (0.0 - 1.0)
    CONGESTION_LOW_MAX: float = 0.35
    CONGESTION_MEDIUM_MAX: float = 0.70

    # Rerouting trigger thresholds
    REROUTE_MIN_ABSOLUTE_IMPROVEMENT_MINUTES: float = 15.0
    REROUTE_MIN_RELATIVE_IMPROVEMENT_PCT: float = 20.0  # In percent

    # Forecast
    FORECAST_HORIZON_HOURS: int = 5

    model_config = SettingsConfigDict(
        env_prefix="M5_",
        env_file=".env",
        extra="ignore"
    )

    @field_validator("SCORE_WEIGHTS")
    @classmethod
    def validate_weights_sum(cls, v: Dict[str, float]) -> Dict[str, float]:
        total = round(sum(v.values()), 4)
        if total != 1.0:
            raise ValueError(f"SCORE_WEIGHTS must sum exactly to 1.0, got {total}")
        return v


settings = Settings()