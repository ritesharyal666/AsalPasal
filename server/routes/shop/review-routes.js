const express = require("express");

const {
  addProductReview,
  getProductReviews,
  editProductReview,
  deleteProductReview,
} = require("../../controllers/shop/product-review-controller");

const { authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/add", authMiddleware, addProductReview);
router.get("/:productId", getProductReviews);
router.put("/edit/:reviewId", authMiddleware, editProductReview);
router.delete("/delete/:reviewId", authMiddleware, deleteProductReview);

module.exports = router;
