from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load model at module level (cached)
model = SentenceTransformer("all-MiniLM-L6-v2")

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

category_names = list(CATEGORY_DESCRIPTIONS.keys())
category_vectors = model.encode(list(CATEGORY_DESCRIPTIONS.values()))


def classify_transaction(description: str) -> dict:
    """Classify a transaction description using sentence-transformer embeddings."""
    txn_vector = model.encode([description])
    scores = cosine_similarity(txn_vector, category_vectors)[0]
    best_index = int(np.argmax(scores))
    best_score = float(scores[best_index])

    if best_score < 0.28:
        return {"category": "Uncategorized", "confidence": 0.0}

    return {
        "category": category_names[best_index],
        "confidence": round(best_score, 4),
    }
