const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");

const searchProducts = async (req, res) => {
  console.log("🎯 SEARCH REQUEST:", {
    keyword: req.params.keyword,
    query: req.query
  });

  try {
    const { keyword } = req.params;
    const { page = 1, limit = 12, category, brand, minPrice, maxPrice } = req.query;
    
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filters
    let filters = {};

    // Add category filter if provided
    if (category && category.length > 0) {
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

    // Add brand filter if provided
    if (brand && brand.length > 0) {
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

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    console.log("🔍 Final filters:", filters);

    // Create search query with scoring
    const searchQuery = {
      ...filters,
      $or: [
        { title: new RegExp(keyword, "i") },
        { description: new RegExp(keyword, "i") },
        { slug: new RegExp(keyword, "i") },
      ],
    };

    console.log("🔎 Search query:", JSON.stringify(searchQuery, null, 2));

    // Use aggregation pipeline for better search with scoring
    const pipeline = [
      { $match: searchQuery },
      {
        $addFields: {
          score: {
            $add: [
              // Exact title match gets highest score (100)
              {
                $cond: {
                  if: { $eq: [{ $toLower: "$title" }, { $toLower: keyword }] },
                  then: 100,
                  else: 0
                }
              },
              // Title starts with keyword (50)
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $toLower: "$title" },
                      regex: `^${keyword.toLowerCase()}`
                    }
                  },
                  then: 50,
                  else: 0
                }
              },
              // Title contains keyword (25)
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $toLower: "$title" },
                      regex: keyword.toLowerCase()
                    }
                  },
                  then: 25,
                  else: 0
                }
              },
              // Description contains keyword (10)
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $toLower: "$description" },
                      regex: keyword.toLowerCase()
                    }
                  },
                  then: 10,
                  else: 0
                }
              },
              // Slug match (15)
              {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $toLower: "$slug" },
                      regex: keyword.toLowerCase()
                    }
                  },
                  then: 15,
                  else: 0
                }
              }
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    ];

    // Get paginated results
    const searchResults = await Product.aggregate(pipeline);
    console.log(`✅ Found ${searchResults.length} products`);

    // Populate category and brand for the results
    const populatedResults = await Product.populate(searchResults, [
      { path: 'category', select: 'label' },
      { path: 'brand', select: 'label' }
    ]);

    // Convert category and brand to labels
    const resultsData = populatedResults.map(product => {
      const prod = product.toObject ? product.toObject() : product;
      prod.category = product.category ? product.category.label : '';
      prod.brand = product.brand ? product.brand.label : '';
      return prod;
    });

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limitNum);

    console.log(`📊 Total: ${totalProducts}, Pages: ${totalPages}`);

    res.status(200).json({
      success: true,
      data: resultsData,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      searchInfo: {
        keyword,
        filters: {
          category: category ? category.split(",") : [],
          brand: brand ? brand.split(",") : [],
          priceRange: { min: minPrice, max: maxPrice }
        }
      }
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message
    });
  }
};

module.exports = { searchProducts };