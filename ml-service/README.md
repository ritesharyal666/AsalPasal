# AsalPasal ML Recommender Service

A Python (FastAPI) microservice that **trains** an unsupervised recommendation
model from the store's MongoDB data and serves recommendations to the Node API.

## The model (what gets trained)

Built in `recommender.py`, fitted on the catalogue + interaction data:

1. **Content model — TF-IDF.** `TfidfVectorizer` learns a vocabulary and IDF
   weights from each product's title + description + category + brand. Product
   similarity = cosine similarity of these vectors.

2. **Collaborative model — matrix factorization (TruncatedSVD).** A sparse
   `user × item` interaction matrix is built from orders (implicit "bought")
   and reviews (rating-weighted). `TruncatedSVD` learns low-dimensional
   **latent factors** per item; similarity is the cosine of those learned
   vectors. This captures *transitive / denoised* relationships that raw
   co-occurrence can't (A↔B, B↔C ⇒ A↔C).

The two are blended per use-case, with order-level co-purchase counts added for
"frequently bought together". The fitted artifact is pickled to `MODEL_PATH`.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | model status + training stats |
| POST | `/train` | retrain from MongoDB |
| GET | `/related/{productId}?limit=` | similar products |
| GET | `/for-you?userId=&limit=` | personalized for a user |
| POST | `/frequently-bought-together` `{productIds, limit}` | cart complements |

Recommendation responses are `{ success, data: [{ productId, score }] }`. The
Node server hydrates those ids into full product objects, so this service stays
a pure ML brain.

## Run

```bash
cd ml-service
python -m venv .venv
# Windows: .venv\Scripts\activate     |  macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # set MONGODB_URI to the same DB the server uses
python app.py               # serves on http://localhost:8000
```

Then set `RECOMMENDER_URL=http://localhost:8000` in `server/.env`.
If this service is down, the Node API automatically falls back to its built-in
JS recommender, so the store keeps working.

## Test (no MongoDB needed)

```bash
python test_recommender.py   # trains on mock data and asserts rankings
```
