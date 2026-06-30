const express = require("express");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");

const router = express.Router();

// Get active categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
});

// Get active brands
router.get("/brands", async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching brands",
    });
  }
});

module.exports = router;