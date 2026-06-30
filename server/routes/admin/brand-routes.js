const express = require("express");
const {
  getAllBrands,
  addBrand,
  updateBrand,
  deleteBrand,
} = require("../../controllers/admin/brand-controller");

const { upload } = require("../../helpers/upload");

const router = express.Router();

router.get("/get", getAllBrands);
router.post("/add", upload.single("image"), addBrand);
router.put("/edit/:id", upload.single("image"), updateBrand);
router.delete("/delete/:id", deleteBrand);

module.exports = router;