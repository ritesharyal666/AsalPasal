const recommender = require("../../services/recommender"); // local JS fallback
const mlClient = require("../../services/mlClient");
const Product = require("../../models/Product");

/**
 * Turn the Python service's ranked [{ productId, score }] into full product
 * objects (live from Mongo, so price/stock are current), preserving rank order
 * and shaping category/brand into labels — the exact shape the client expects.
 */
async function hydrate(items) {
  const ids = (items || []).map((i) => i.productId);
  if (!ids.length) return [];

  const products = await Product.find({ _id: { $in: ids } })
    .populate("category", "label")
    .populate("brand", "label")
    .lean();

  const byId = new Map(products.map((p) => [String(p._id), p]));
  return ids
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map((p) => ({
      ...p,
      category: p.category ? p.category.label : "",
      brand: p.brand ? p.brand.label : "",
    }));
}

// GET /api/shop/recommend/related/:productId?limit=6
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    let data = [];
    try {
      data = await hydrate(await mlClient.getRelated(productId, limit));
    } catch (mlErr) {
      console.warn("[recommend] ML service unavailable, using local:", mlErr.message);
    }
    if (!data.length) data = await recommender.getRelatedProducts(productId, limit);

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

// GET /api/shop/recommend/for-you?userId=<id>&limit=8
const getRecommendationsForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);

    let data = [];
    try {
      data = await hydrate(await mlClient.getForYou(userId, limit));
    } catch (mlErr) {
      console.warn("[recommend] ML service unavailable, using local:", mlErr.message);
    }
    if (!data.length) data = await recommender.getRecommendationsForUser(userId, limit);

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

// POST /api/shop/recommend/frequently-bought-together  { productIds: [], limit }
const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productIds = [], limit } = req.body;
    const safeLimit = Math.min(parseInt(limit) || 4, 20);
    const ids = Array.isArray(productIds) ? productIds : [];

    let data = [];
    try {
      data = await hydrate(await mlClient.getFrequentlyBought(ids, safeLimit));
    } catch (mlErr) {
      console.warn("[recommend] ML service unavailable, using local:", mlErr.message);
    }
    if (!data.length)
      data = await recommender.getFrequentlyBoughtTogether(ids, safeLimit);

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

module.exports = {
  getRelatedProducts,
  getRecommendationsForUser,
  getFrequentlyBoughtTogether,
};
