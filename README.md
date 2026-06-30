# AsalPasal

A MERN-stack e-commerce application (React + Vite, Node/Express, MongoDB) with an
**ML-based product recommender system**.

## Recommender system

Recommendations are produced by a trained, model-based ML service
(`ml-service/`, Python + scikit-learn) and served through the Node API:

- **Content model — TF-IDF.** A `TfidfVectorizer` is fitted on each product's
  title + description + category + brand; similarity = cosine of the vectors.
- **Collaborative model — matrix factorization.** A `user × item` matrix from
  orders + reviews is decomposed with `TruncatedSVD` to learn latent item
  factors, capturing transitive/denoised similarity. Order-level co-purchase
  counts add a "frequently bought together" signal.

The Node server calls the Python service for rankings, hydrates them into full
products from Mongo, and **falls back to a built-in JS recommender**
(`server/services/recommender.js`) if the ML service is unavailable — so the
store always works. See `ml-service/README.md` for the model details.

Surfaced in three places:

| Surface | Endpoint |
| --- | --- |
| "You may also like" (product page) | `GET /api/shop/recommend/related/:productId` |
| "Recommended for you" (home) | `GET /api/shop/recommend/for-you?userId=` |
| "Frequently bought together" (cart) | `POST /api/shop/recommend/frequently-bought-together` |

## Getting started

```bash
# server
cd server
cp .env.example .env   # fill in real values
npm install
npm run dev

# client
cd client
cp .env.example .env
npm install
npm run dev

# ML recommender service (optional; Node falls back without it)
cd ml-service
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set MONGODB_URI to the same DB
python app.py               # http://localhost:8000
```

Requires a running MongoDB instance (see `MONGODB_URI` in `server/.env`).
