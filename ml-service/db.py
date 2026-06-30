"""MongoDB access for the recommender service (read-only)."""

from pymongo import MongoClient

import config

_client: MongoClient | None = None


def get_db():
    global _client
    if _client is None:
        _client = MongoClient(config.MONGODB_URI)
    if config.MONGO_DB:
        return _client[config.MONGO_DB]
    db = _client.get_default_database()
    if db is None:
        raise RuntimeError(
            "No database name in MONGODB_URI; set MONGO_DB in ml-service/.env"
        )
    return db


def load_data(db):
    """Load products (with category/brand labels), orders and reviews."""
    categories = {
        str(c["_id"]): c.get("label", "")
        for c in db.categories.find({}, {"label": 1})
    }
    brands = {
        str(b["_id"]): b.get("label", "")
        for b in db.brands.find({}, {"label": 1})
    }

    products = []
    for p in db.products.find(
        {}, {"title": 1, "description": 1, "category": 1, "brand": 1}
    ):
        products.append(
            {
                "_id": p["_id"],
                "title": p.get("title"),
                "description": p.get("description"),
                "category_label": categories.get(str(p.get("category")), ""),
                "brand_label": brands.get(str(p.get("brand")), ""),
            }
        )

    orders = list(
        db.orders.find({}, {"userId": 1, "cartItems.productId": 1})
    )
    reviews = list(
        db.productreviews.find(
            {}, {"productId": 1, "userId": 1, "reviewValue": 1}
        )
    )
    return products, orders, reviews
