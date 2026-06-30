const recommender = require("../../services/recommender");

// GET /api/shop/recommend/related/:productId?limit=6
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const data = await recommender.getRelatedProducts(productId, limit);
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

    const data = await recommender.getRecommendationsForUser(userId, limit);
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

    const data = await recommender.getFrequentlyBoughtTogether(
      Array.isArray(productIds) ? productIds : [],
      safeLimit
    );
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
