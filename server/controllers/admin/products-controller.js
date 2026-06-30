const { getFileUrl, deleteFile } = require("../../helpers/upload");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const fs = require("fs");
const path = require("path");

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
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

    const fileUrl = getFileUrl(req.file.filename);
    
    // Verify file exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    const filePath = path.join(uploadsDir, req.file.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({
        success: false,
        message: "File upload failed",
      });
    }
    
    res.json({
      success: true,
      result: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.log(error);
    
    // Clean up file if error occurs
    if (req.file && req.file.filename) {
      deleteFile(req.file.filename);
    }
    
    res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      costPrice,
      totalStock,
      averageReview,
    } = req.body;

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    if (!title || !category || !brand || !price || !totalStock) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Validate category and brand ObjectIds
    if (!category.match(/^[0-9a-fA-F]{24}$/) || !brand.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or brand ID format",
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if brand exists
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return res.status(400).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Validate each image
    for (const image of images) {
      if (!image || image.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "All image URLs must be valid",
        });
      }
      if (!image.startsWith("http")) {
        const filename = path.basename(image);
        const uploadsDir = path.join(__dirname, "../../uploads");
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
          return res.status(400).json({
            success: false,
            message: `Image file ${filename} does not exist on server`,
          });
        }
      }
    }

    console.log(averageReview, "averageReview");

    const newlyCreatedProduct = new Product({
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      costPrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

//fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, brand } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (brand) {
      filter.brand = brand;
    }

    const listOfProducts = await Product.find(filter).skip(skip).limit(limitNum);
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNum);
    
    // Filter out products with invalid images
    const validProducts = listOfProducts.filter((product) => {
      // Check if images array exists and has at least one valid image
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        return false;
      }

      // Check if at least one image is valid
      return product.images.some((image) => {
        if (!image || image.trim() === "") {
          return false;
        }

        // If it's a local path, check if file exists
        if (!image.startsWith("http")) {
          const filename = path.basename(image);
          const uploadsDir = path.join(__dirname, "../../uploads");
          const filePath = path.join(uploadsDir, filename);
          return fs.existsSync(filePath);
        }

        // If it's an external URL, include it
        return true;
      });
    });
    
    res.status(200).json({
      success: true,
      data: validProducts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      costPrice,
      totalStock,
      averageReview,
    } = req.body;

    console.log('Edit product request:', { id, title, category, brand });

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      console.log('Product not found:', id);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate category and brand ObjectIds if provided
    if (category && !category.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    if (brand && !brand.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid brand ID format",
      });
    }

    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    // Check if brand exists if provided
    if (brand) {
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(400).json({
          success: false,
          message: "Brand not found",
        });
      }
    }

    // If images are being updated, validate them
    if (images && Array.isArray(images) && images.length > 0) {
      // Validate each new image
      for (const image of images) {
        if (!image || image.trim() === "") {
          return res.status(400).json({
            success: false,
            message: "All image URLs must be valid",
          });
        }
        if (!image.startsWith("http")) {
          const filename = path.basename(image);
          const uploadsDir = path.join(__dirname, "../../uploads");
          const filePath = path.join(uploadsDir, filename);

          if (!fs.existsSync(filePath)) {
            return res.status(400).json({
              success: false,
              message: `Image file ${filename} does not exist on server`,
            });
          }
        }
      }

      // Delete old images if they are local files
      if (findProduct.images && Array.isArray(findProduct.images)) {
        for (const oldImage of findProduct.images) {
          if (oldImage && !oldImage.startsWith("http")) {
            const oldFilename = path.basename(oldImage);
            deleteFile(oldFilename);
          }
        }
      }

      findProduct.images = images;
    }

    // Update fields
    if (title !== undefined) findProduct.title = title;
    if (description !== undefined) findProduct.description = description;
    if (category !== undefined) findProduct.category = category;
    if (brand !== undefined) findProduct.brand = brand;
    if (price !== undefined) findProduct.price = price === "" ? 0 : price;
    if (salePrice !== undefined) findProduct.salePrice = salePrice === "" ? 0 : salePrice;
    if (costPrice !== undefined) findProduct.costPrice = costPrice === "" ? 0 : costPrice;
    if (totalStock !== undefined) findProduct.totalStock = totalStock;
    if (averageReview !== undefined) findProduct.averageReview = averageReview;

    console.log('Saving product:', findProduct);

    await findProduct.save();

    console.log('Product saved successfully');

    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.error('Error in editProduct:', e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
      error: e.message,
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    // Delete the image file if it exists and is local
    if (product.image && !product.image.startsWith("http")) {
      const filename = product.image.split('/').pop();
      deleteFile(filename);
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};