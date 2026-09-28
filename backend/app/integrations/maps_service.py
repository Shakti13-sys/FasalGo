import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.intelligence.distance import haversine_distance

logger = logging.getLogger("fasalgo.maps")

_route_cache: Dict[str, Dict[str, Any]] = {}


def get_live_route(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
) -> Dict[str, Any]:
    """
    Calculates live driving distance and transit duration between coordinates.
    Uses Google Maps Routes/Distance Matrix if MAPS_API_KEY is configured,
    with instant fallback to calibrated Haversine + road winding factor model.
    """
    cache_key = f"{round(origin_lat, 4)},{round(origin_lon, 4)}->{round(dest_lat, 4)},{round(dest_lon, 4)}"
    if cache_key in _route_cache:
        return _route_cache[cache_key]

    if settings.MAPS_API_KEY:
        try:
            url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin_lat},{origin_lon}&destinations={dest_lat},{dest_lon}&key={settings.MAPS_API_KEY}"
            with httpx.Client(timeout=3.0) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("status") == "OK" and data.get("rows"):
                        elem = data["rows"][0]["elements"][0]
                        if elem.get("status") == "OK":
                            dist_km = elem["distance"]["value"] / 1000.0
                            dur_mins = elem["duration"]["value"] / 60.0
                            result = {
                                "distance_km": round(dist_km, 2),
                                "duration_minutes": round(dur_mins, 1),
                                "source": "google_maps_api",
                            }
                            _route_cache[cache_key] = result
                            return result
        except Exception as e:
            logger.warning(f"Google Maps API call failed, falling back to internal model: {e}")

    # Accurate fallback road model (Haversine * 1.25 road winding factor @ avg 35-40 km/h rural transport)
    crow_flies_km = haversine_distance(origin_lat, origin_lon, dest_lat, dest_lon)
    road_dist_km = crow_flies_km * 1.25
    travel_mins = (road_dist_km / 38.0) * 60.0

    result = {
        "distance_km": round(road_dist_km, 2),
        "duration_minutes": round(travel_mins, 1),
        "source": "haversine_road_model",
    }
    _route_cache[cache_key] = result
    return result
