const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh", page = 1, limit = 12 } = req.query;

    let filters = {};

    if (category.length) {
      const categoryValues = category.split(",");
      const categoryIds = [];
      const categoryNames = [];
      
      categoryValues.forEach(val => {
        if (val.match(/^[0-9a-fA-F]{24}$/)) {
          categoryIds.push(val);
        } else {
          categoryNames.push(val);
        }
      });
      
      let allCategoryIds = [...categoryIds];
      
      if (categoryNames.length > 0) {
        const categoryDocs = await Category.find({ label: { $in: categoryNames } });
        allCategoryIds = [...allCategoryIds, ...categoryDocs.map(cat => cat._id)];
      }
      
      if (allCategoryIds.length) {
        filters.category = { $in: allCategoryIds };
      }
    }

    if (brand.length) {
      const brandValues = brand.split(",");
      const brandIds = [];
      const brandNames = [];
      
      brandValues.forEach(val => {
        if (val.match(/^[0-9a-fA-F]{24}$/)) {
          brandIds.push(val);
        } else {
          brandNames.push(val);
        }
      });
      
      let allBrandIds = [...brandIds];
      
      if (brandNames.length > 0) {
        const brandDocs = await Brand.find({ label: { $in: brandNames } });
        allBrandIds = [...allBrandIds, ...brandDocs.map(brand => brand._id)];
      }
      
      if (allBrandIds.length) {
        filters.brand = { $in: allBrandIds };
      }
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filters).populate('category', 'label').populate('brand', 'label').sort(sort).skip(skip).limit(limitNum);
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limitNum);

    // Convert category and brand to labels
    const productsData = products.map(product => {
      const prod = product.toObject();
      prod.category = product.category ? product.category.label : '';
      prod.brand = product.brand ? product.brand.label : '';
      return prod;
    });

    res.status(200).json({
      success: true,
      data: productsData,
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
      message: "Some error occurred",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug }).populate('category', 'label').populate('brand', 'label');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Convert to plain object and replace category/brand with labels
    const productData = product.toObject();
    productData.category = product.category ? product.category.label : '';
    productData.brand = product.brand ? product.brand.label : '';

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };