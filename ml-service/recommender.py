"""
Trained, model-based recommender (unsupervised ML).

Two models are *fitted* on the store's data:

  1. Content model  - TfidfVectorizer learns a vocabulary + IDF weights from
     each product's text (title + description + category + brand).

  2. Collaborative model - a sparse user x item interaction matrix is built
     from orders + reviews, then TruncatedSVD (matrix factorization) learns
     low-dimensional *latent factors* for every item. Item similarity is the
     cosine similarity of those learned latent vectors, which captures
     transitive / denoised relationships that raw co-occurrence cannot.

The fitted artifacts (vectorizer, matrices, latent factors) are real trained
objects and can be pickled to disk via save()/load().
"""

from __future__ import annotations

import pickle
from collections import Counter, defaultdict
from dataclasses import dataclass, field

import numpy as np
from scipy.sparse import csr_matrix
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

# Blend weights per use-case (content, collaborative).
WEIGHTS = {
    "related": (0.55, 0.45),
    "frequently_bought": (0.2, 0.8),
    "for_you": (0.5, 0.5),
}

# Target latent dimensionality for the SVD (clamped to what the data allows).
SVD_COMPONENTS = 32


@dataclass
class RecommenderModel:
    product_ids: list[str] = field(default_factory=list)
    index_of: dict[str, int] = field(default_factory=dict)
    content_sim: np.ndarray | None = None      # (n_items, n_items)
    collab_sim: np.ndarray | None = None        # (n_items, n_items) or None
    co_purchase: dict[int, Counter] = field(default_factory=dict)
    user_items: dict[str, dict[int, float]] = field(default_factory=dict)
    popularity: np.ndarray | None = None        # (n_items,)
    vectorizer: TfidfVectorizer | None = None
    svd: TruncatedSVD | None = None
    n_users: int = 0
    n_interactions: int = 0

    # ------------------------------------------------------------------ fit
    @classmethod
    def fit(cls, products, orders, reviews) -> "RecommenderModel":
        product_ids = [str(p["_id"]) for p in products]
        index_of = {pid: i for i, pid in enumerate(product_ids)}
        n = len(product_ids)

        m = cls(product_ids=product_ids, index_of=index_of)
        if n == 0:
            return m

        # --- 1. Content model: TF-IDF + cosine -------------------------------
        corpus = []
        for p in products:
            parts = [
                p.get("title") or "",
                p.get("description") or "",
                p.get("category_label") or "",
                p.get("brand_label") or "",
            ]
            corpus.append(" ".join(parts))

        m.vectorizer = TfidfVectorizer(stop_words="english", min_df=1)
        try:
            tfidf = m.vectorizer.fit_transform(corpus)
            m.content_sim = cosine_similarity(tfidf)
        except ValueError:
            # empty vocabulary (no usable text) -> no content signal
            m.content_sim = np.zeros((n, n))

        # --- 2. Collaborative model: interaction matrix + SVD ----------------
        # user_key -> row index
        user_rows: dict[str, int] = {}
        rows, cols, data = [], [], []

        def add(user_key, item_idx, weight):
            r = user_rows.setdefault(user_key, len(user_rows))
            rows.append(r)
            cols.append(item_idx)
            data.append(weight)

        co = defaultdict(Counter)
        profiles: dict[str, dict[int, float]] = defaultdict(lambda: defaultdict(float))
        for o in orders:
            uid = str(o.get("userId"))
            items = []
            for ci in o.get("cartItems", []) or []:
                idx = index_of.get(str(ci.get("productId")))
                if idx is None:
                    continue
                add(f"u:{uid}", idx, 1.0)  # implicit "bought"
                profiles[uid][idx] += 1.0
                items.append(idx)
            uniq = list(set(items))
            for i in range(len(uniq)):
                for j in range(i + 1, len(uniq)):
                    co[uniq[i]][uniq[j]] += 1
                    co[uniq[j]][uniq[i]] += 1

        for rv in reviews:
            idx = index_of.get(str(rv.get("productId")))
            if idx is None:
                continue
            uid = str(rv.get("userId"))
            weight = max(0.2, (float(rv.get("reviewValue") or 0)) / 5.0)
            add(f"r:{uid}", idx, weight)
            profiles[uid][idx] += weight

        m.co_purchase = {k: v for k, v in co.items()}
        m.user_items = {u: dict(items) for u, items in profiles.items()}
        m.n_interactions = len(data)

        if data:
            n_users = len(user_rows)
            m.n_users = n_users
            interaction = csr_matrix(
                (data, (rows, cols)), shape=(n_users, n)
            )
            # popularity = total interaction weight per item (fallback ranking)
            m.popularity = np.asarray(interaction.sum(axis=0)).ravel()

            # SVD needs n_components < min(matrix dims)
            k = min(SVD_COMPONENTS, min(interaction.shape) - 1)
            if k >= 1:
                m.svd = TruncatedSVD(n_components=k, random_state=42)
                m.svd.fit(interaction)               # learn latent factors
                item_factors = m.svd.components_.T    # (n_items, k)
                # zero-out items that never appeared so they don't get
                # spurious similarity from the decomposition
                seen = np.asarray((interaction != 0).sum(axis=0)).ravel() > 0
                item_factors[~seen] = 0.0
                item_factors = normalize(item_factors)
                m.collab_sim = item_factors @ item_factors.T
        else:
            m.popularity = np.zeros(n)

        return m

    # --------------------------------------------------------------- scoring
    def _hybrid_row(self, idx: int, kind: str) -> np.ndarray:
        wc, wb = WEIGHTS[kind]
        content = self.content_sim[idx] if self.content_sim is not None else 0
        if self.collab_sim is not None:
            collab = self.collab_sim[idx]
            score = wc * content + wb * collab
            # where there is no collaborative signal, lean on content alone
            no_collab = self.collab_sim[idx] == 0
            score = np.where(no_collab, content, score)
        else:
            score = np.asarray(content, dtype=float)
        return np.asarray(score, dtype=float)

    def _popular(self, exclude: set[int], limit: int) -> list[tuple[str, float]]:
        if self.popularity is None:
            order = list(range(len(self.product_ids)))
        else:
            order = list(np.argsort(-self.popularity))
        out = []
        for i in order:
            if i in exclude:
                continue
            out.append((self.product_ids[i], 0.0))
            if len(out) >= limit:
                break
        return out

    def _rank(self, scores: np.ndarray, exclude: set[int], limit: int):
        ranked = []
        for i in np.argsort(-scores):
            if i in exclude or scores[i] <= 0:
                continue
            ranked.append((self.product_ids[i], float(scores[i])))
            if len(ranked) >= limit:
                break
        if len(ranked) < limit:
            have = exclude | {self.index_of[pid] for pid, _ in ranked}
            ranked.extend(self._popular(have, limit - len(ranked)))
        return ranked

    # ----------------------------------------------------------- public API
    def related(self, product_id: str, limit: int = 6):
        idx = self.index_of.get(str(product_id))
        if idx is None:
            return self._popular(set(), limit)
        scores = self._hybrid_row(idx, "related")
        return self._rank(scores, {idx}, limit)

    def frequently_bought_together(self, product_ids, limit: int = 4):
        seeds = [self.index_of[str(p)] for p in product_ids if str(p) in self.index_of]
        if not seeds:
            return self._popular(set(), limit)
        exclude = set(seeds)
        agg = np.zeros(len(self.product_ids))
        for s in seeds:
            # strong explicit signal: real co-purchase counts
            for other, count in self.co_purchase.get(s, {}).items():
                if other not in exclude:
                    agg[other] += count
            # softer signal: hybrid similarity
            agg += self._hybrid_row(s, "frequently_bought")
        return self._rank(agg, exclude, limit)

    def for_user(self, user_id: str, limit: int = 8):
        """Recommend from the user's own purchase + review history."""
        seeds = self.user_items.get(str(user_id), {})
        if not seeds:
            return self._popular(set(), limit)
        exclude = set(seeds)
        agg = np.zeros(len(self.product_ids))
        for idx, w in seeds.items():
            agg += self._hybrid_row(idx, "for_you") * w
        return self._rank(agg, exclude, limit)

    # ------------------------------------------------------------ persistence
    def save(self, path: str) -> None:
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @staticmethod
    def load(path: str) -> "RecommenderModel":
        with open(path, "rb") as f:
            return pickle.load(f)

    def stats(self) -> dict:
        return {
            "products": len(self.product_ids),
            "users": self.n_users,
            "interactions": self.n_interactions,
            "svd_components": int(self.svd.n_components) if self.svd else 0,
            "has_collab": self.collab_sim is not None,
        }
