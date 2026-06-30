"""
FastAPI recommender microservice.

On startup it trains the model from MongoDB. Recommendations return ranked
productIds + scores; the Node API hydrates those into full product objects.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel

import config
import db as dbmod
from recommender import RecommenderModel

state: dict = {"model": None}


def train_model() -> RecommenderModel:
    database = dbmod.get_db()
    products, orders, reviews = dbmod.load_data(database)
    model = RecommenderModel.fit(products, orders, reviews)
    state["model"] = model
    try:
        model.save(config.MODEL_PATH)
    except Exception as e:  # persistence is best-effort
        print("Could not persist model:", e)
    return model


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Prefer a freshly trained model; fall back to a persisted artifact.
    try:
        m = train_model()
        print("Trained model:", m.stats())
    except Exception as e:
        print("Training on startup failed:", e)
        if os.path.exists(config.MODEL_PATH):
            try:
                state["model"] = RecommenderModel.load(config.MODEL_PATH)
                print("Loaded persisted model.")
            except Exception as e2:
                print("Could not load persisted model:", e2)
    yield


app = FastAPI(title="AsalPasal Recommender", version="1.0.0", lifespan=lifespan)


class FBTBody(BaseModel):
    productIds: list[str] = []
    limit: int = 4


def to_data(pairs):
    return [{"productId": pid, "score": round(score, 4)} for pid, score in pairs]


@app.get("/health")
def health():
    m = state["model"]
    return {"success": True, "trained": m is not None, "stats": m.stats() if m else None}


@app.post("/train")
def retrain():
    m = train_model()
    return {"success": True, "stats": m.stats()}


@app.get("/related/{product_id}")
def related(product_id: str, limit: int = 6):
    m = state["model"]
    if m is None:
        return {"success": False, "data": []}
    return {"success": True, "data": to_data(m.related(product_id, limit))}


@app.get("/for-you")
def for_you(userId: str | None = None, limit: int = 8):
    m = state["model"]
    if m is None:
        return {"success": False, "data": []}
    pairs = m.for_user(userId, limit) if userId else m._popular(set(), limit)
    return {"success": True, "data": to_data(pairs)}


@app.post("/frequently-bought-together")
def frequently_bought_together(body: FBTBody):
    m = state["model"]
    if m is None:
        return {"success": False, "data": []}
    pairs = m.frequently_bought_together(body.productIds, body.limit)
    return {"success": True, "data": to_data(pairs)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=config.PORT, reload=False)
