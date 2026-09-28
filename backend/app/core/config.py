import json
from typing import Any, Dict, List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FasalGo - Smart Procurement & Queue Intelligence Engine"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./fasalgo.db"

    # Security & Auth
    SECRET_KEY: str = "fasalgo-sih26032-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["*"]

    # Recommendation Weights (Sum should equal 1.0)
    WEIGHT_DISTANCE: float = 0.25
    WEIGHT_WAIT_TIME: float = 0.40
    WEIGHT_CONGESTION: float = 0.20
    WEIGHT_AVAILABILITY: float = 0.15

    # Congestion thresholds (0.0 to 1.0)
    CONGESTION_LOW_MAX: float = 0.35
    CONGESTION_MEDIUM_MAX: float = 0.70

    # Rerouting thresholds
    REROUTE_MIN_ABSOLUTE_IMPROVEMENT_MINUTES: float = 15.0
    REROUTE_MIN_RELATIVE_IMPROVEMENT_PCT: float = 20.0

    # Upper bounds for normalization
    MAX_REASONABLE_DISTANCE_KM: float = 50.0
    MAX_REASONABLE_WAIT_MINUTES: float = 120.0

    # Forecasting
    FORECAST_HORIZON_HOURS: int = 5

    # External APIs
    MAPS_API_KEY: str = ""
    WEATHER_API_KEY: str = ""
    SMS_GATEWAY_API_KEY: str = ""
    SMS_GATEWAY_PROVIDER: str = "FAST2SMS"
    GROQ_API_KEY: str = ""

    @property
    def SCORE_WEIGHTS(self) -> Dict[str, float]:
        return {
            "distance": self.WEIGHT_DISTANCE,
            "wait_time": self.WEIGHT_WAIT_TIME,
            "congestion": self.WEIGHT_CONGESTION,
            "availability": self.WEIGHT_AVAILABILITY,
        }

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
