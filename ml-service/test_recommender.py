"""Standalone test: trains the real model on mock data (no Mongo needed)."""
from recommender import RecommenderModel

products = [
    {"_id": "p1", "title": "Red Running Shoes", "description": "lightweight running shoe for marathon runners", "category_label": "Footwear", "brand_label": "Nike"},
    {"_id": "p2", "title": "Blue Running Shoes", "description": "breathable running shoe for daily jogging", "category_label": "Footwear", "brand_label": "Adidas"},
    {"_id": "p3", "title": "Leather Wallet", "description": "premium leather wallet with card slots", "category_label": "Accessories", "brand_label": "Gucci"},
    {"_id": "p4", "title": "Running Socks", "description": "cushioned socks for running and sports", "category_label": "Footwear", "brand_label": "Nike"},
    {"_id": "p5", "title": "Smartphone X", "description": "flagship smartphone with great camera", "category_label": "Electronics", "brand_label": "Apple"},
]
orders = [
    {"userId": "userA", "cartItems": [{"productId": "p1"}, {"productId": "p4"}]},
    {"userId": "userB", "cartItems": [{"productId": "p1"}, {"productId": "p4"}]},
    {"userId": "userC", "cartItems": [{"productId": "p3"}, {"productId": "p5"}]},
]
reviews = [{"productId": "p2", "userId": "userA", "reviewValue": 5}]

m = RecommenderModel.fit(products, orders, reviews)
title = {p["_id"]: p["title"] for p in products}
fmt = lambda pairs: ", ".join(f"{title[i]}({s:.3f})" for i, s in pairs)

print("STATS:", m.stats())
print("\nrelated to p1 (Red Running Shoes):\n ", fmt(m.related("p1", 4)))
print("\nfrequently bought together [p1]:\n ", fmt(m.frequently_bought_together(["p1"], 3)))
print("\nfor-you userA (bought p1,p4; rated p2):\n ", fmt(m.for_user("userA", 4)))
print("\nfor-you anonymous-ish (popular):\n ", fmt(m._popular(set(), 3)))

# assertions
rel = m.related("p1", 4)
fbt = [i for i, _ in m.frequently_bought_together(["p1"], 3)]
assert m.stats()["has_collab"] is True, "SVD collaborative model should be trained"
assert m.stats()["svd_components"] >= 1, "SVD should have learned latent factors"
assert rel[0][0] != "p1", "must not recommend the seed itself"
assert fbt[0] == "p4", f"co-purchased socks should rank first, got {fbt}"
assert "p1" not in [i for i, _ in m.for_user("userA", 4)], "owned items excluded"
print("\nALL ASSERTIONS PASSED")
