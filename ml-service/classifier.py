import json
import os
import socket
import time
from urllib import request, error

CATEGORY_DESCRIPTIONS = {
    "Food": "food delivery order restaurant swiggy zomato meal eating dining grocery quick commerce",
    "Transport": "cab ride travel fuel petrol uber ola railway metro bus ticket commute flight",
    "Entertainment": "movie ticket streaming music subscription netflix spotify bookmyshow cinema",
    "Utilities": "electricity bill water gas mobile recharge internet airtel jio broadband",
    "Shopping": "online shopping clothes purchase amazon flipkart myntra retail store",
    "Health": "medicine pharmacy hospital doctor clinic health apollo diagnostic gym fitness",
    "Finance": "loan EMI insurance mutual fund SIP investment credit card tax payment",
    "Education": "school fee tuition course books coaching exam online learning university",
    "Transfers": "transfer sent NEFT RTGS IMPS self account family UPI payment",
}

HF_ZERO_SHOT_URL = os.getenv(
    "HF_ZERO_SHOT_URL",
    "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
)
HF_ZERO_SHOT_FALLBACK_URL = os.getenv(
    "HF_ZERO_SHOT_FALLBACK_URL",
    "https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli",
)
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "").strip().strip('"').strip("'")
HF_TIMEOUT_SECONDS = int(os.getenv("HF_TIMEOUT_SECONDS", "30"))
HF_MAX_RETRIES = int(os.getenv("HF_MAX_RETRIES", "2"))
HF_RETRY_BACKOFF_SECONDS = float(os.getenv("HF_RETRY_BACKOFF_SECONDS", "1.5"))
HF_DEBUG_FLOW = os.getenv("HF_DEBUG_FLOW", "false").lower() in {
    "1",
    "true",
    "yes",
    "on",
}

category_names = list(CATEGORY_DESCRIPTIONS.keys())


def print(message: str) -> None:
    if HF_DEBUG_FLOW:
        print(f"[HF_FLOW] {message}", flush=True)


def _call_hf_zero_shot(description: str) -> tuple[str, float]:
    print("Start _call_hf_zero_shot")
    payload = {
        "inputs": description,
        "parameters": {
            "candidate_labels": category_names,
            "multi_label": False,
        },
        "options": {
            "wait_for_model": True,
        },
    }

    data = json.dumps(payload).encode("utf-8")
    base_headers = {"Content-Type": "application/json"}
    print(
        "Prepared payload and headers "
        f"(desc_len={len(description)}, token_present={bool(HF_API_TOKEN)}, "
        f"timeout={HF_TIMEOUT_SECONDS}, retries={HF_MAX_RETRIES})"
    )

    response_data = None
    last_error = None

    for url in (HF_ZERO_SHOT_URL, HF_ZERO_SHOT_FALLBACK_URL):
        print(f"Trying URL: {url}")
        headers_to_try = [base_headers]
        if HF_API_TOKEN:
            auth_value = (
                HF_API_TOKEN
                if HF_API_TOKEN.lower().startswith("bearer ")
                else f"Bearer {HF_API_TOKEN}"
            )
            headers_to_try = [
                {**base_headers, "Authorization": auth_value},
                base_headers,
            ]

        for headers in headers_to_try:
            print(
                "Trying auth mode: "
                + ("with Authorization" if "Authorization" in headers else "without Authorization")
            )
            for attempt in range(HF_MAX_RETRIES + 1):
                try:
                    print(f"Attempt {attempt + 1}/{HF_MAX_RETRIES + 1}")
                    req = request.Request(url, data=data, headers=headers, method="POST")
                    with request.urlopen(req, timeout=HF_TIMEOUT_SECONDS) as resp:  # nosec B310
                        response_data = json.loads(resp.read().decode("utf-8"))
                    print("HF request succeeded")
                    break
                except error.HTTPError as e:
                    last_error = e
                    print(f"HTTPError code={e.code}")
                    # Retry alternate endpoint if one route is deprecated.
                    if e.code in (404, 410):
                        print("Endpoint deprecated/unavailable, switching endpoint")
                        break
                    # 401 with token can happen due to wrong format/scope; try without token once.
                    if e.code == 401:
                        print("Auth rejected (401), trying next auth mode")
                        break
                    # Retry transient upstream failures.
                    if e.code in (429, 500, 502, 503, 504) and attempt < HF_MAX_RETRIES:
                        print("Transient error, backing off and retrying")
                        time.sleep(HF_RETRY_BACKOFF_SECONDS * (attempt + 1))
                        continue
                    raise
                except (error.URLError, TimeoutError, socket.timeout) as e:
                    last_error = e
                    print(f"Network/timeout error: {e}")
                    if attempt < HF_MAX_RETRIES:
                        print("Backing off and retrying after network issue")
                        time.sleep(HF_RETRY_BACKOFF_SECONDS * (attempt + 1))
                        continue
                    break

            if response_data is not None:
                break

        if response_data is not None:
            break

    if response_data is None:
        print("No response data from all endpoints/auth modes")
        if last_error:
            raise last_error
        return "Uncategorized", 0.0

    labels = []
    scores = []

    # Standard zero-shot response shape: {"labels": [...], "scores": [...]}.
    if isinstance(response_data, dict):
        print("Parsing dict response shape")
        labels = response_data.get("labels") or []
        scores = response_data.get("scores") or []

    # Some routed endpoints can return a list like:
    # [{"label": "Food", "score": 0.91}, ...] or nested [[...]].
    elif isinstance(response_data, list):
        print("Parsing list response shape")
        items = response_data
        if items and isinstance(items[0], list):
            items = items[0]

        if items and isinstance(items[0], dict):
            parsed = [
                (str(item.get("label", "")), float(item.get("score", 0.0)))
                for item in items
                if isinstance(item, dict)
            ]
            parsed = [p for p in parsed if p[0]]
            parsed.sort(key=lambda x: x[1], reverse=True)
            labels = [p[0] for p in parsed]
            scores = [p[1] for p in parsed]

    if not labels or not scores:
        print("No labels/scores found after parsing")
        return "Uncategorized", 0.0

    category = labels[0]
    confidence = float(scores[0])
    print(f"Top prediction: category={category}, confidence={confidence:.4f}")
    return category, confidence


def classify_transaction(description: str) -> dict:
    """Classify a transaction description using Hugging Face zero-shot API."""
    print("Start classify_transaction")
    try:
        category, confidence = _call_hf_zero_shot(description)
        if confidence < 0.30:
            print("Confidence below threshold, returning Uncategorized")
            return {"category": "Uncategorized", "confidence": 0.0}

        print("Returning HF classification result")
        return {
            "category": category,
            "confidence": round(confidence, 4),
        }
    except Exception as e:
        print(f"Classification failed with exception: {e}")
        print(
            "Error calling HF API after retries, falling back to default classification. "
            "Increase HF_TIMEOUT_SECONDS or verify network/token. "
            f"Error: {str(e)}"
        )
        return {"category": "Uncategorized", "confidence": 0.0}
