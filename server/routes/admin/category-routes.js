const express = require("express");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/admin/category-controller");

const { upload } = require("../../helpers/upload");

const router = express.Router();

router.get("/get", getAllCategories);
router.post("/add", upload.single("image"), addCategory);
router.put("/edit/:id", upload.single("image"), updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;