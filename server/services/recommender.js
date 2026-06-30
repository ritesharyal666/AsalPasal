/**
 * ML-based recommender system (pure Node.js, no external ML service).
 *
 * Combines two classic, unsupervised techniques:
 *
 *  1. Content-based filtering
 *     - Each product is turned into a TF-IDF vector built from its
 *       title + description + category + brand.
 *     - Similarity between two products = cosine similarity of their vectors.
 *     - Always works, even with zero order history (solves cold-start).
 *
 *  2. Item-based collaborative filtering
 *     - From Orders + Reviews we build an implicit "user x item" interaction
 *       matrix. Two products are similar if the same users tend to buy/rate
 *       both ("users who bought this also bought ...").
 *     - We also track order-level co-purchase counts for the classic
 *       "frequently bought together" signal.
 *
 * The hybrid score is a weighted blend of the two. When a product has no
 * collaborative signal yet, the score gracefully falls back to content-only.
 *
 * The model is rebuilt from the database at most once every CACHE_TTL_MS so
 * we don't re-vectorise the whole catalogue on every request.
 */

const Product = require("../models/Product");
const Order = require("../models/Order");
const ProductReview = require("../models/Review");

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000; // rebuild the model at most every 5 minutes

// Blend weights for the hybrid score (per use-case).
const WEIGHTS = {
  // "related products" on a product page
  related: { content: 0.55, collab: 0.45 },
  // "frequently bought together" leans on real co-purchase behaviour
  frequentlyBought: { content: 0.2, collab: 0.8 },
  // "recommended for you" aggregates over a user's history
  forYou: { content: 0.5, collab: 0.5 },
};

// Very small English stop-word list — enough to clean up product text.
const STOPWORDS = new Set(
  (
    "a an and are as at be by for from has have in into is it its of on or " +
    "that the this to was were will with your you our we all new use using " +
    "made make best top great quality product item items"
  ).split(/\s+/)
);

// ----------------------------------------------------------------------------
// Text helpers (tokenisation + TF-IDF)
// ----------------------------------------------------------------------------

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Build unit-normalised TF-IDF vectors for every product.
 * Returns a Map: productId -> { vec: Map<term, weight>, norm }.
 */
function buildContentVectors(products) {
  const docTokens = new Map(); // id -> term-frequency Map
  const df = new Map(); // term -> document frequency

  for (const p of products) {
    const text = [p.title, p.description, p._categoryLabel, p._brandLabel]
      .filter(Boolean)
      .join(" ");
    const tokens = tokenize(text);

    const tf = new Map();
    for (const tok of tokens) tf.set(tok, (tf.get(tok) || 0) + 1);
    docTokens.set(p._idStr, tf);

    for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  }

  const N = products.length || 1;
  const vectors = new Map();

  for (const [id, tf] of docTokens.entries()) {
    const vec = new Map();
    let sumSq = 0;
    for (const [term, count] of tf.entries()) {
      // sublinear TF + smoothed IDF
      const tfWeight = 1 + Math.log(count);
      const idf = Math.log(N / (1 + (df.get(term) || 0))) + 1;
      const w = tfWeight * idf;
      vec.set(term, w);
      sumSq += w * w;
    }
    vectors.set(id, { vec, norm: Math.sqrt(sumSq) || 1 });
  }

  return vectors;
}

/** Cosine similarity between two sparse {vec, norm} vectors. */
function cosineSparse(a, b) {
  if (!a || !b) return 0;
  // iterate the smaller map for speed
  const [small, large] = a.vec.size <= b.vec.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, w] of small.vec.entries()) {
    const w2 = large.vec.get(term);
    if (w2) dot += w * w2;
  }
  return dot / (a.norm * b.norm);
}

// ----------------------------------------------------------------------------
// Collaborative-filtering helpers
// ----------------------------------------------------------------------------

/**
 * Build the implicit user x item matrix + order-level co-purchase counts.
 *  - itemUsers:   itemId -> Map<userKey, weight>   (column vectors per item)
 *  - itemNorms:   itemId -> L2 norm of that column
 *  - coPurchase:  itemId -> Map<otherItemId, count>
 *  - popularity:  itemId -> interaction score (for fallback ranking)
 */
function buildCollaborative(orders, reviews, validIds) {
  const itemUsers = new Map();
  const coPurchase = new Map();
  const popularity = new Map();

  const addInteraction = (itemId, userKey, weight) => {
    if (!validIds.has(itemId)) return;
    if (!itemUsers.has(itemId)) itemUsers.set(itemId, new Map());
    const users = itemUsers.get(itemId);
    users.set(userKey, (users.get(userKey) || 0) + weight);
    popularity.set(itemId, (popularity.get(itemId) || 0) + weight);
  };

  const bumpCoPurchase = (a, b) => {
    if (!coPurchase.has(a)) coPurchase.set(a, new Map());
    const m = coPurchase.get(a);
    m.set(b, (m.get(b) || 0) + 1);
  };

  // --- Orders: purchase signal + co-purchase pairs ---
  for (const order of orders) {
    const userKey = `u:${order.userId}`;
    const itemsInOrder = [];
    for (const ci of order.cartItems || []) {
      const itemId = String(ci.productId);
      if (!validIds.has(itemId)) continue;
      addInteraction(itemId, userKey, 1); // implicit "1 = bought"
      itemsInOrder.push(itemId);
    }
    // every unordered pair in the same order co-occurs once
    const unique = [...new Set(itemsInOrder)];
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        bumpCoPurchase(unique[i], unique[j]);
        bumpCoPurchase(unique[j], unique[i]);
      }
    }
  }

  // --- Reviews: interest signal scaled by rating (0.2 .. 1.0) ---
  for (const r of reviews) {
    const itemId = String(r.productId);
    const userKey = `r:${r.userId}`;
    const weight = Math.max(0.2, (Number(r.reviewValue) || 0) / 5);
    addInteraction(itemId, userKey, weight);
  }

  // precompute item column norms for cosine
  const itemNorms = new Map();
  for (const [itemId, users] of itemUsers.entries()) {
    let sumSq = 0;
    for (const w of users.values()) sumSq += w * w;
    itemNorms.set(itemId, Math.sqrt(sumSq) || 1);
  }

  return { itemUsers, itemNorms, coPurchase, popularity };
}

/** Item-based collaborative cosine similarity between two items. */
function collabSim(model, idA, idB) {
  const a = model.itemUsers.get(idA);
  const b = model.itemUsers.get(idB);
  if (!a || !b) return 0;
  const [small, other] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [userKey, w] of small.entries()) {
    const w2 = other.get(userKey);
    if (w2) dot += w * w2;
  }
  return dot / (model.itemNorms.get(idA) * model.itemNorms.get(idB));
}

// ----------------------------------------------------------------------------
// Model build + cache
// ----------------------------------------------------------------------------

let modelCache = null;
let modelBuiltAt = 0;
let buildPromise = null;

async function buildModel() {
  const [products, orders, reviews] = await Promise.all([
    Product.find({})
      .populate("category", "label")
      .populate("brand", "label")
      .lean(),
    Order.find({}, "userId cartItems").lean(),
    ProductReview.find({}, "productId userId reviewValue").lean(),
  ]);

  // annotate products with string id + labels (and an API-ready copy)
  for (const p of products) {
    p._idStr = String(p._id);
    p._categoryLabel = p.category && p.category.label ? p.category.label : "";
    p._brandLabel = p.brand && p.brand.label ? p.brand.label : "";
  }

  const validIds = new Set(products.map((p) => p._idStr));
  const productById = new Map(products.map((p) => [p._idStr, p]));

  const contentVectors = buildContentVectors(products);
  const collab = buildCollaborative(orders, reviews, validIds);

  return {
    products,
    productById,
    validIds,
    contentVectors,
    ...collab,
  };
}

async function getModel({ force = false } = {}) {
  const fresh = modelCache && Date.now() - modelBuiltAt < CACHE_TTL_MS;
  if (fresh && !force) return modelCache;
  if (buildPromise) return buildPromise; // coalesce concurrent rebuilds

  buildPromise = buildModel()
    .then((m) => {
      modelCache = m;
      modelBuiltAt = Date.now();
      return m;
    })
    .finally(() => {
      buildPromise = null;
    });

  return buildPromise;
}

/** Invalidate the cache (e.g. after a new product/order is created). */
function invalidate() {
  modelCache = null;
  modelBuiltAt = 0;
}

// ----------------------------------------------------------------------------
// Public API shaping
// ----------------------------------------------------------------------------

/** Convert an internal product into the shape the storefront tile expects. */
function toApiProduct(p) {
  return {
    _id: p._id,
    title: p.title,
    description: p.description,
    images: p.images,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    totalStock: p.totalStock,
    averageReview: p.averageReview,
    category: p._categoryLabel,
    brand: p._brandLabel,
  };
}

/** Hybrid similarity between two product ids for a given use-case weight set. */
function hybridSim(model, idA, idB, w) {
  const content = cosineSparse(
    model.contentVectors.get(idA),
    model.contentVectors.get(idB)
  );
  const collab = collabSim(model, idA, idB);
  // if there is no collaborative signal at all, use content only
  if (collab === 0) return content;
  return w.content * content + w.collab * collab;
}

/** Top-N products by popularity (orders + reviews), then averageReview. */
function popularProducts(model, limit, excludeIds = new Set()) {
  return model.products
    .filter((p) => !excludeIds.has(p._idStr))
    .map((p) => ({
      p,
      pop: model.popularity.get(p._idStr) || 0,
      rev: p.averageReview || 0,
    }))
    .sort((a, b) => b.pop - a.pop || b.rev - a.rev)
    .slice(0, limit)
    .map((x) => toApiProduct(x.p));
}

// ----------------------------------------------------------------------------
// Recommendation queries
// ----------------------------------------------------------------------------

/**
 * "You may also like" — products similar to a single seed product.
 */
async function getRelatedProducts(productId, limit = 6) {
  const model = await getModel();
  const seedId = String(productId);
  if (!model.validIds.has(seedId)) return popularProducts(model, limit);

  const w = WEIGHTS.related;
  const scored = [];
  for (const p of model.products) {
    if (p._idStr === seedId) continue;
    const score = hybridSim(model, seedId, p._idStr, w);
    if (score > 0) scored.push({ p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const results = scored.slice(0, limit).map((x) => toApiProduct(x.p));

  // pad with popular items if the catalogue/signal is sparse
  if (results.length < limit) {
    const have = new Set([seedId, ...results.map((r) => String(r._id))]);
    results.push(...popularProducts(model, limit - results.length, have));
  }
  return results;
}

/**
 * "Frequently bought together" — given the items currently in the cart,
 * recommend complementary products. Prefers real order co-purchase counts,
 * then falls back to hybrid similarity.
 */
async function getFrequentlyBoughtTogether(productIds = [], limit = 4) {
  const model = await getModel();
  const seedIds = productIds.map(String).filter((id) => model.validIds.has(id));
  const exclude = new Set(seedIds);

  if (seedIds.length === 0) return popularProducts(model, limit);

  const scores = new Map(); // candidateId -> accumulated score
  const w = WEIGHTS.frequentlyBought;

  for (const seedId of seedIds) {
    // strong signal: co-purchase counts from real orders
    const co = model.coPurchase.get(seedId);
    if (co) {
      for (const [otherId, count] of co.entries()) {
        if (exclude.has(otherId)) continue;
        scores.set(otherId, (scores.get(otherId) || 0) + count);
      }
    }
    // softer signal: hybrid similarity across the catalogue
    for (const p of model.products) {
      const cand = p._idStr;
      if (exclude.has(cand)) continue;
      const sim = hybridSim(model, seedId, cand, w);
      if (sim > 0) scores.set(cand, (scores.get(cand) || 0) + sim);
    }
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => toApiProduct(model.productById.get(id)));

  if (ranked.length < limit) {
    const have = new Set([...exclude, ...ranked.map((r) => String(r._id))]);
    ranked.push(...popularProducts(model, limit - ranked.length, have));
  }
  return ranked;
}

/**
 * "Recommended for you" — personalised from the user's own purchase + review
 * history. Aggregates hybrid similarity from every item the user interacted
 * with, excluding items they already have. Falls back to popular products for
 * anonymous users or users with no history.
 */
async function getRecommendationsForUser(userId, limit = 8) {
  const model = await getModel();
  if (!userId) return popularProducts(model, limit);

  const uid = String(userId);

  // gather the user's interacted items from orders + reviews
  const [orders, reviews] = await Promise.all([
    Order.find({ userId: uid }, "cartItems").lean(),
    ProductReview.find({ userId: uid }, "productId reviewValue").lean(),
  ]);

  const profile = new Map(); // itemId -> interaction weight
  for (const o of orders) {
    for (const ci of o.cartItems || []) {
      const id = String(ci.productId);
      if (model.validIds.has(id)) profile.set(id, (profile.get(id) || 0) + 1);
    }
  }
  for (const r of reviews) {
    const id = String(r.productId);
    if (model.validIds.has(id)) {
      const wgt = Math.max(0.2, (Number(r.reviewValue) || 0) / 5);
      profile.set(id, (profile.get(id) || 0) + wgt);
    }
  }

  if (profile.size === 0) return popularProducts(model, limit);

  const w = WEIGHTS.forYou;
  const scores = new Map();
  for (const [seedId, seedWeight] of profile.entries()) {
    for (const p of model.products) {
      const cand = p._idStr;
      if (profile.has(cand)) continue; // skip items the user already has
      const sim = hybridSim(model, seedId, cand, w);
      if (sim > 0) scores.set(cand, (scores.get(cand) || 0) + sim * seedWeight);
    }
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => toApiProduct(model.productById.get(id)));

  if (ranked.length < limit) {
    const have = new Set([
      ...profile.keys(),
      ...ranked.map((r) => String(r._id)),
    ]);
    ranked.push(...popularProducts(model, limit - ranked.length, have));
  }
  return ranked;
}

module.exports = {
  getRelatedProducts,
  getFrequentlyBoughtTogether,
  getRecommendationsForUser,
  invalidate,
  getModel, // exported for warm-up / testing
};
