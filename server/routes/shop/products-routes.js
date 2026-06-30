const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:slug", getProductDetails);

module.exports = router;