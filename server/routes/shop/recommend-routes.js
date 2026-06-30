const express = require("express");

const {
  getRelatedProducts,
  getRecommendationsForUser,
  getFrequentlyBoughtTogether,
} = require("../../controllers/shop/recommend-controller");

const router = express.Router();

router.get("/related/:productId", getRelatedProducts);
router.get("/for-you", getRecommendationsForUser);
router.post("/frequently-bought-together", getFrequentlyBoughtTogether);

module.exports = router;
