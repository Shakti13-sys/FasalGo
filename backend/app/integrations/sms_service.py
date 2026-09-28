import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("fasalgo.sms")


def send_sms_alert(
    mobile_number: str,
    message: str,
    flash: int = 0,
) -> Dict[str, Any]:
    """
    Dispatches a real-time SMS to the farmer's registered phone number.
    Supports Fast2SMS Quick SMS / Transactional Route.
    """
    clean_mobile = "".join(filter(str.isdigit, mobile_number))
    if len(clean_mobile) > 10:
        clean_mobile = clean_mobile[-10:]

    if not clean_mobile or len(clean_mobile) != 10:
        logger.warning(f"Invalid mobile number for SMS dispatch: {mobile_number}")
        return {"status": "error", "message": "Invalid mobile number"}

    if not settings.SMS_GATEWAY_API_KEY:
        logger.info(f"[SMS Dry-Run] To: {clean_mobile} | Content: {message}")
        return {"status": "simulated", "message": "SMS logged (No Gateway API Key configured)"}

    try:
        headers = {
            "authorization": settings.SMS_GATEWAY_API_KEY,
            "Content-Type": "application/json",
        }
        payload = {
            "route": "q",
            "message": message,
            "flash": flash,
            "numbers": clean_mobile,
        }
        with httpx.Client(timeout=4.0) as client:
            resp = client.post("https://www.fast2sms.com/dev/bulkV2", headers=headers, json=payload)
            data = resp.json()
            if resp.status_code == 200 and data.get("return") is True:
                logger.info(f"SMS successfully dispatched to {clean_mobile}")
                return {"status": "success", "response": data}
            else:
                msg = data.get("message", "Gateway rejected request")
                logger.warning(f"[SMS Gateway Notice] {clean_mobile}: {msg}")
                return {"status": "gateway_advisory", "message": msg}
    except Exception as e:
        logger.error(f"SMS dispatch error to {clean_mobile}: {e}")
        return {"status": "error", "message": str(e)}
