import json
import os
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
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

category_names = list(CATEGORY_DESCRIPTIONS.keys())


def _call_hf_zero_shot(description: str) -> tuple[str, float]:
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
    headers = {"Content-Type": "application/json"}

    if HF_API_TOKEN:
        headers["Authorization"] = f"Bearer {HF_API_TOKEN}"

    req = request.Request(HF_ZERO_SHOT_URL, data=data, headers=headers, method="POST")

    with request.urlopen(req, timeout=12) as resp:  # nosec B310
        response_data = json.loads(resp.read().decode("utf-8"))

    labels = response_data.get("labels") or []
    scores = response_data.get("scores") or []

    if not labels or not scores:
        return "Uncategorized", 0.0

    category = labels[0]
    confidence = float(scores[0])
    return category, confidence


def classify_transaction(description: str) -> dict:
    """Classify a transaction description using Hugging Face zero-shot API."""
    try:
        category, confidence = _call_hf_zero_shot(description)

        if confidence < 0.30:
            return {"category": "Uncategorized", "confidence": 0.0}

        return {
            "category": category,
            "confidence": round(confidence, 4),
        }
    except (error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
        return {"category": "Uncategorized", "confidence": 0.0}
