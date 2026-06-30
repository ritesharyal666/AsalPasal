# AsalPasal

A MERN-stack e-commerce application (React + Vite, Node/Express, MongoDB) with an
**ML-based product recommender system**.

## Recommender system

A hybrid recommender (`server/services/recommender.js`) combining two unsupervised
ML techniques, running entirely in Node — no external ML service:

- **Content-based filtering** — TF-IDF vectors over each product's title,
  description, category and brand, compared with cosine similarity. Works even
  with no sales history (cold-start safe).
- **Item-based collaborative filtering** — an implicit user×item matrix built
  from orders and reviews, plus order-level co-purchase counts.

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
```

Requires a running MongoDB instance (see `MONGODB_URI` in `server/.env`).
