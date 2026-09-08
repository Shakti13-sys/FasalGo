# Module 5 — Procurement Intelligence Engine
### SIH26032 — Farmer Procurement Platform

Backend module that turns queue/ETA/centre data into actionable decisions:
smart centre recommendations, best-time-to-visit, congestion detection,
5-hour congestion forecasting, and dynamic rerouting.

---

## 1. Architecture

```
app/
  core/
    config.py            # weights, thresholds, all tunables (no magic numbers elsewhere)
    constants.py          # CongestionLevel, OperationalStatus enums
  schemas/
    common.py             # CentreSnapshot, Coordinates
    recommendation.py      # All request/response Pydantic models
  integrations/
    m4_client.py          # WaitTimePredictor interface + StubWaitTimePredictor
    m3_client.py           # QueueDataProvider interface + StubQueueDataProvider
  data/
    centre_repository.py  # Synthetic centre dataset + repository (M2 stand-in)
  intelligence/            # Pure logic, no I/O, fully unit-testable
    distance.py            # Haversine distance
    congestion.py          # Congestion index + LOW/MEDIUM/HIGH classification
    scoring.py             # Weighted, transparent recommendation scoring
    forecast.py            # 5-hour congestion/wait forecast
    best_time.py           # Best-time-to-visit (built on forecast.py)
    rerouting.py           # Reroute decision logic (thresholded)
  services/
    recommendation_service.py  # Orchestrates integrations + intelligence
  routes/
    recommendations.py     # Thin FastAPI routes -> service only
  main.py                  # FastAPI app entrypoint
```

**Data flow:** `routes` → `services` → (`integrations` for live M3/M4 data) + (`intelligence` for pure calculations) → response.

Business logic never lives in routes. Routes only validate input and call the service.

---

## 2. How M5 Consumes M4 (Wait-Time Prediction)

`app/integrations/m4_client.py` defines:

```python
class WaitTimePredictor(ABC):
    def predict(self, centre_id, farmer_lat, farmer_lon, at_time) -> WaitTimePrediction:
        ...
```

`WaitTimePrediction` = `{ predicted_wait_minutes, eta_minutes, confidence }`.

Right now `StubWaitTimePredictor` implements this with a deterministic synthetic
formula (queue/counters × avg processing time × hour-of-day multiplier) so demos
are reproducible. **To integrate the real M4 model:**

1. Implement the same `WaitTimePredictor` interface in a new class, e.g. `M4ModelClient`, that calls the actual trained model / M4's API.
2. In `m4_client.py`, change:
   ```python
   _predictor_instance: WaitTimePredictor = StubWaitTimePredictor()
   ```
   to
   ```python
   _predictor_instance: WaitTimePredictor = M4ModelClient()
   ```
3. Nothing else in M5 changes — `recommendation_service.py`, routes, and schemas are untouched.

---

## 3. How M5 Consumes M3 (Queue/Token State)

`app/integrations/m3_client.py` defines:

```python
class QueueDataProvider(ABC):
    def get_queue_state(self, centre_id) -> QueueState: ...
    def get_token_info(self, token_id) -> TokenInfo: ...
```

`StubQueueDataProvider` currently derives queue state from the same synthetic
centre repository. **To integrate the real M3 module:**

1. Implement `QueueDataProvider` in a class that queries M3's actual DB tables / service, returning the same `QueueState` / `TokenInfo` dataclasses.
2. Swap `_provider_instance` in `m3_client.py` the same way as M4 above.

**Assumption documented:** `TokenInfo.booked_at_eta_minutes` (the ETA shown to
the farmer at booking time) is currently mocked at a fixed value in the stub
since M3 doesn't exist yet — M3's real implementation must persist and return
this value from the actual booking record.

---

## 4. Recommendation Scoring Approach

Each centre is scored 0–100 via a **transparent weighted sum** (weights in `core/config.py`, defaults: wait 40%, distance 25%, congestion 20%, availability 15%):

1. Each raw factor (distance, wait, congestion index, counter availability) is normalized to 0–1 (1 = best).
2. Weighted sum → score.
3. Every recommendation returns the raw factors **and** the score, plus a human-readable `reason` string — never an opaque black-box number.

This directly satisfies the required example: a closer-but-slow centre can lose to a farther-but-fast one, and the response explains why.

---

## 5. Congestion Detection Approach

`congestion_index` (0–1) = weighted combination of:
- **counter load** (queue ÷ active counters), 50%
- **utilization** (queue ÷ daily capacity), 35%
- **processing drag** (how much slower than baseline processing time), 15%

Thresholds (configurable in `core/config.py`) map the index to LOW / MEDIUM / HIGH. No hardcoded per-centre congestion values anywhere.

---

## 6. 5-Hour Forecast Approach

Deliberately **not** deep learning (overkill for this signal). Uses:
- A documented, synthetic-but-realistic hourly demand-shape curve (peak at 9–11am and 3–5pm — typical mandi/procurement-centre pattern).
- The centre's current queue is projected forward by the ratio of future-hour demand to current-hour demand (bounded to 0.4×–2.0× per step to avoid unrealistic swings).
- Each projected queue is re-run through the **same** congestion classifier used live, so forecast and live congestion are always consistent.

Replace `HOURLY_LOAD_SHAPE` in `forecast.py` with real historical averages once available — no other logic changes needed.

---

## 7. Dynamic Rerouting Logic

Compares the current centre's live-recomputed ETA against the best nearby alternative. A reroute is only recommended if the improvement clears **both**:
- an absolute threshold (default ≥15 min), **and**
- a relative threshold (default ≥20%)

This prevents noisy, flip-floppy suggestions for marginal differences. The module **only returns a recommendation** — it never mutates the farmer's booking/token (that stays M3's job, as required).

---

## 8. Setup & Run

```bash
cd m5_procurement_intelligence
pip install -r requirements.txt --break-system-packages   # if using system Python
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API docs: `http://localhost:8000/docs`

---

## 9. API Reference & curl Examples

### GET `/recommendations/centres?lat=<>&lon=<>`
Returns a ranked list of nearby OPEN centres with score + explanation.
```bash
curl "http://localhost:8000/recommendations/centres?lat=19.99&lon=73.79"
```

### GET `/recommendations/best-time?centre_id=<>`
```bash
curl "http://localhost:8000/recommendations/best-time?centre_id=C002"
```

### GET `/congestion/{centre_id}`
```bash
curl "http://localhost:8000/congestion/C004"
```

### GET `/forecast/{centre_id}`
```bash
curl "http://localhost:8000/forecast/C004"
```

### GET `/recommendations/reroute/{token_id}`
Token format in the stub: `TKN-{centre_id}-{seq}` (e.g. `TKN-C002-0042`).
```bash
curl "http://localhost:8000/recommendations/reroute/TKN-C002-0042"
```

### Error handling
Unknown `centre_id` / `token_id` → `404` with a descriptive JSON error body.
PAUSED centres are automatically excluded from `/recommendations/centres`.

---

## 10. Synthetic Data / Assumptions

Since live government procurement data isn't available, `app/data/centre_repository.py` ships 5 synthetic centres around a sample district, deliberately spanning LOW/MEDIUM/HIGH congestion scenarios out of the box (documented in-file). Replace `CentreRepository` internals with a real SQLAlchemy-backed implementation against the actual `centres` table (owned by M2) — the public interface (`get`, `list_all`, `list_nearby`) stays the same so nothing downstream changes.

`TokenInfo.booked_at_eta_minutes` in the M3 stub is a fixed placeholder (25.0 min) — real M3 must supply the actual value recorded at booking time.

---

## 11. Integration Checklist

**For M3 team:** Implement `QueueDataProvider` (see section 3). Ensure `get_token_info` returns the real `booked_at_eta_minutes` from the booking record.

**For M4 team:** Implement `WaitTimePredictor` (see section 2). Return `confidence` as a genuine model confidence score, not a placeholder.

**For M6/frontend team:** All 5 endpoints return typed Pydantic JSON (see `/docs` for exact schemas). No auth/session handling is done here — that's M1's responsibility; pass `token_id` from the farmer's active booking directly.

---

## 12. What This Module Deliberately Does NOT Do

- No M1 (auth), M2 (centre CRUD), M3 (queue/token), M4 (ML training), or M6 (payments/notifications) implementation — only clean interfaces/stubs.
- No frontend.
- No unnecessary microservices or LLM/chatbot usage.
- No hardcoded final outputs — every number is computed from the (currently synthetic) input data through the documented logic above.
