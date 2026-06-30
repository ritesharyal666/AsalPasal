const Category = require("../../models/Category");
const { getFileUrl, deleteFile } = require("../../helpers/upload");
const fs = require("fs");
const path = require("path");

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
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
};

// Add new category
const addCategory = async (req, res) => {
  try {
    console.log('addCategory called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    const { id, label, isActive } = req.body;

    if (!id || !label) {
      return res.status(400).json({
        success: false,
        message: "Category ID and label are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Category image is required",
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
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

    // Verify file exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({
        success: false,
        message: "File upload failed",
      });
    }

    const existingCategory = await Category.findOne({ id });
    if (existingCategory) {
      deleteFile(req.file.filename);
      return res.status(400).json({
        success: false,
        message: "Category with this ID already exists",
      });
    }

    const imageUrl = getFileUrl(req.file.filename);

    const newCategory = new Category({
      id,
      label,
      image: imageUrl,
      isActive: isActive === "true" || isActive === true,
    });

    await newCategory.save();
    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    // Clean up file if error occurs
    if (req.file && req.file.filename) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: "Error adding category",
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    console.log('updateCategory called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    const { id } = req.params;
    const { label, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    let updateData = {
      label: label || category.label,
      isActive: isActive === "true" || isActive === true,
    };

    // If new image is uploaded
    if (req.file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
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

      // Verify file exists
      const uploadsDir = path.join(__dirname, "../../uploads");
      const filePath = path.join(uploadsDir, req.file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(500).json({
          success: false,
          message: "File upload failed",
        });
      }

      // Delete old image if it exists and is local
      if (category.image && !category.image.startsWith("http")) {
        const oldFilename = category.image.split("/").pop();
        deleteFile(oldFilename);
      }

      updateData.image = getFileUrl(req.file.filename);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    // Clean up file if error occurs
    if (req.file && req.file.filename) {
      deleteFile(req.file.filename);
    }
    res.status(500).json({
      success: false,
      message: "Error updating category",
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Delete the image file if it exists and is local
    if (category.image && !category.image.startsWith("http")) {
      const filename = category.image.split("/").pop();
      deleteFile(filename);
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
    });
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};