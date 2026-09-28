import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("fasalgo.weather")

_weather_cache: Dict[str, Dict[str, Any]] = {}


def get_centre_weather(lat: float, lon: float, centre_name: str = "") -> Dict[str, Any]:
    """
    Fetches live weather conditions for a procurement centre coordinate.
    Evaluates rain risk and moisture impact on open weighbridges.
    """
    cache_key = f"{round(lat, 2)},{round(lon, 2)}"
    if cache_key in _weather_cache:
        return _weather_cache[cache_key]

    if settings.WEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={settings.WEATHER_API_KEY}&units=metric"
            with httpx.Client(timeout=3.0) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    temp = data.get("main", {}).get("temp", 28.0)
                    humidity = data.get("main", {}).get("humidity", 45)
                    weather_main = data.get("weather", [{}])[0].get("main", "Clear")
                    is_rainy = "rain" in weather_main.lower()
                    result = {
                        "temperature_c": temp,
                        "humidity_pct": humidity,
                        "condition": weather_main,
                        "is_rainy": is_rainy,
                        "moisture_risk": "HIGH" if (is_rainy or humidity > 75) else "NORMAL",
                        "source": "live_openweathermap",
                    }
                    _weather_cache[cache_key] = result
                    return result
        except Exception as e:
            logger.warning(f"Weather API fetch failed for {centre_name}: {e}")

    # Standard seasonal baseline for Rajasthan agricultural season
    result = {
        "temperature_c": 31.5,
        "humidity_pct": 38,
        "condition": "Sunny / Clear",
        "is_rainy": False,
        "moisture_risk": "OPTIMAL",
        "source": "climatological_baseline",
    }
    _weather_cache[cache_key] = result
    return result
