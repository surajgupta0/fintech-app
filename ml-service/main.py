from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from classifier import classify_transaction
import uvicorn

app = FastAPI(title="FinTrack ML Classifier", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClassifyRequest(BaseModel):
    description: str


class ClassifyResponse(BaseModel):
    category: str
    confidence: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    if not req.description or len(req.description.strip()) < 2:
        raise HTTPException(status_code=400, detail="Description too short")
    result = classify_transaction(req.description)
    return ClassifyResponse(**result)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
