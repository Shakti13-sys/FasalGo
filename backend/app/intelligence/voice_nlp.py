import json
import logging
from typing import Optional
import httpx
from app.core.config import settings
from app.schemas.voice import VoiceQueryResponse

logger = logging.getLogger("fasalgo.voice")


def process_farmer_voice_query(
    query: str,
    token_number: Optional[int] = None,
    currently_serving: Optional[int] = None,
    estimated_wait: Optional[int] = None,
    best_centre_name: Optional[str] = None,
    payment_amount: Optional[float] = None,
    payment_status: Optional[str] = None,
    procurement_stage: Optional[str] = None,
) -> VoiceQueryResponse:
    """
    Processes natural farmer voice/text queries in Hindi, Hinglish, or English.
    Uses Groq LLM intelligence when GROQ_API_KEY is available,
    falling back to rule-based keyword classification.
    """
    token = token_number or 47
    serving = currently_serving or 32
    wait = estimated_wait or 18
    centre = best_centre_name or "Jaipur APMC Mandi"
    amt_str = f"₹{int(payment_amount):,}" if payment_amount else "₹42,500"
    p_status = payment_status or "Disbursed via DBT"
    stage = procurement_stage or "Quality Verification (Grade A)"

    if settings.GROQ_API_KEY:
        try:
            prompt = f"""
You are the AI Voice Assistant for FasalGo (SIH26032 Smart Mandi Procurement Platform).
A farmer has spoken this query: "{query}"

Farmer's Current Live State:
- Token Number: #{token}
- Currently Serving: #{serving}
- Estimated Wait Time: {wait} minutes
- Best Centre: {centre}
- Payment: {amt_str} ({p_status})
- Procurement Stage: {stage}

Respond in the SAME language the farmer asked (Hindi / Hinglish / English).
Keep the response polite, helpful, concise (2 sentences max), clear for a rural farmer.
Determine appropriate navigation action:
- "navigate:live-queue" for token/turn/queue/eta queries
- "navigate:visit-planner" for centre recommendation or slot queries
- "navigate:procurement" for crop quality, weighment, grading
- "navigate:payment" for payment / DBT money transfer
- null for general greeting/help

Return strictly JSON with keys "response" and "action".
"""
            headers = {
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "qwen/qwen3.8-27b",
                "messages": [
                    {"role": "system", "content": "You are FasalGo AI Voice Assistant. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.3,
            }
            with httpx.Client(timeout=4.0) as client:
                resp = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    raw_content = resp.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(raw_content)
                    return VoiceQueryResponse(
                        query=query,
                        response=parsed.get("response", "Aapka token number process ho raha hai."),
                        action=parsed.get("action"),
                    )
        except Exception as e:
            logger.warning(f"Groq LLM voice NLP fallback to rule engine: {e}")

    # Robust local rule-based fallback
    q = query.lower()

    # 1. Token / Turn Query
    if any(k in q for k in ["token", "turn", "kab", "when", "number", "बारी", "टोकन", "नंबर", "wait"]):
        resp = f"Aapka token #{token} lagbhag {wait} minute me aayega. Abhi counter par token #{serving} chal raha hai ({centre})."
        return VoiceQueryResponse(query=query, response=resp, action="navigate:live-queue")

    # 2. Centre Recommendation Query
    if any(k in q for k in ["centre", "best", "kaunsa", "recommend", "where", "kahan", "mandi", "मंडी", "कहा"]):
        resp = f"{centre} aapke liye sabse best hai — kam bheed aur fast processing counters uplabdh hain."
        return VoiceQueryResponse(query=query, response=resp, action="navigate:visit-planner")

    # 3. Procurement Status Query
    if any(k in q for k in ["procurement", "quality", "weighing", "stage", "kya", "status", "fasal", "फसल", "तोल"]):
        resp = f"Aapki fasal ka status: {stage} at {centre}. Weighing complete ho chuki hai."
        return VoiceQueryResponse(query=query, response=resp, action="navigate:procurement")

    # 4. Payment Query
    if any(k in q for k in ["payment", "paid", "paisa", "rupees", "money", "paise", "account", "dbt", "पैसे", "भुगतान"]):
        resp = f"Aapka {amt_str} ka payment {p_status} ho chuka hai aur DBT dwara bank account me transfer ho gaya hai."
        return VoiceQueryResponse(query=query, response=resp, action="navigate:payment")

    # 5. Queue Length Query
    if any(k in q for k in ["queue", "line", "bheed", "crowd", "भीड़", "लाइन"]):
        ahead = max(1, token - serving)
        resp = f"Aapke aage line me {ahead} kisan hain. Lagbhag {wait} minute ka samay lagega."
        return VoiceQueryResponse(query=query, response=resp, action="navigate:live-queue")

    # Default fallback
    return VoiceQueryResponse(
        query=query,
        response=(
            "Namaste! FasalGo AI me aapka swagat hai. Aap mujhse live token, mandi recommendation, "
            "best time to visit, ya payment status ke bare me puch sakte hain."
        ),
        action=None,
    )
