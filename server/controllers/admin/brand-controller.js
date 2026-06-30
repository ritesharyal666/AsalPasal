const Brand = require("../../models/Brand");
const Product = require("../../models/Product");
const { getFileUrl, deleteFile } = require("../../helpers/upload");
const fs = require("fs");
const path = require("path");

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ createdAt: -1 });
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
};

// Add new brand
const addBrand = async (req, res) => {
  try {
    const { id, label, isActive } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Brand image is required",
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "Only image files (JPEG, PNG, WEBP) are allowed",
      });
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB",
      });
    }

    const existingBrand = await Brand.findOne({ id });
    if (existingBrand) {
      deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "Brand with this ID already exists",
      });
    }

    const imageUrl = getFileUrl(req.file.filename);

    const newBrand = new Brand({
      id,
      label,
      image: imageUrl,
      isActive: isActive === "true" || isActive === true,
    });

    await newBrand.save();
    res.status(201).json({
      success: true,
      data: newBrand,
    });
  } catch (error) {
    console.log(error);
    // Clean up file if error occurs
    if (req.file && req.file.filename) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: "Error adding brand",
    });
  }
};

// Update brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, isActive } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    let updateData = {
      label: label || brand.label,
      isActive: isActive === "true" || isActive === true,
    };

    // If new image is uploaded
    if (req.file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        deleteFile(req.file.filename);
        return res.status(400).json({
          success: false,
          message: "Only image files (JPEG, PNG, WEBP) are allowed",
        });
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (req.file.size > maxSize) {
        deleteFile(req.file.filename);
        return res.status(400).json({
          success: false,
          message: "File size must be less than 5MB",
        });
      }

      // Delete old image if it exists and is local
      if (brand.image && !brand.image.startsWith("http")) {
        const oldFilename = brand.image.split("/").pop();
        deleteFile(oldFilename);
      }

      updateData.image = getFileUrl(req.file.filename);
    }

    const updatedBrand = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: updatedBrand,
    });
  } catch (error) {
    console.log(error);
    // Clean up file if error occurs
    if (req.file && req.file.filename) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: "Error updating brand",
    });
  }
};

// Delete brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if brand is used by any products
    const productsUsingBrand = await Product.find({ brand: id });
    if (productsUsingBrand.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete brand. It is associated with existing products.",
      });
    }

    // Delete the image file if it exists and is local
    if (brand.image && !brand.image.startsWith("http")) {
      const filename = brand.image.split("/").pop();
      deleteFile(filename);
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting brand",
    });
  }
};

module.exports = {
  getAllBrands,
  addBrand,
  updateBrand,
  deleteBrand,
};