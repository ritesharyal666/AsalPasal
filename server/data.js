const mongoose = require("mongoose");
const Brand = require("./models/Brand");
const Category = require("./models/Category");
const Product = require("./models/Product");

// Import the data
const data = require("./sendData.json");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/");
    console.log("Connected to MongoDB");

    // Clear existing data
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared existing data");

    // Insert brands
    const brands = await Brand.insertMany(data.brands);
    const brandMap = {};
    brands.forEach((brand, index) => {
      brandMap[data.brands[index].id] = {
        _id: brand._id,
        label: brand.label
      };
    });
    console.log(`✅ Inserted ${brands.length} brands`);

    // Insert categories
    const categories = await Category.insertMany(data.categories);
    const categoryMap = {};
    categories.forEach((category, index) => {
      categoryMap[data.categories[index].id] = {
        _id: category._id,
        label: category.label
      };
    });
    console.log(`✅ Inserted ${categories.length} categories`);

    // Insert products ONE BY ONE and track which products belong to which brand/category
    console.log("Inserting products...");
    const brandProducts = {}; // Track products per brand
    const categoryProducts = {}; // Track products per category
    let insertedCount = 0;

    for (const productData of data.products) {
      try {
        // Get brand and category ObjectIds
        const brandId = brandMap[productData.brand]._id;
        const categoryId = categoryMap[productData.category]._id;

        // Create product with brand/category as ObjectIds
        const productToInsert = {
          ...productData,
          category: categoryId,
          brand: brandId
        };
        
        const product = new Product(productToInsert);
        await product.save();
        
        // Track this product for the brand
        if (!brandProducts[productData.brand]) {
          brandProducts[productData.brand] = [];
        }
        brandProducts[productData.brand].push(product._id);

        // Track this product for the category
        if (!categoryProducts[productData.category]) {
          categoryProducts[productData.category] = [];
        }
        categoryProducts[productData.category].push(product._id);

        insertedCount++;
        console.log(`✅ Inserted product: ${product.title}`);
      } catch (error) {
        console.error(`❌ Error inserting product ${productData.title}:`, error.message);
      }
    }
    console.log(`✅ Inserted ${insertedCount} products total`);

    // Update brands with their product references (if your schema supports it)
    console.log("\n📎 Linking products to brands and categories...");
    for (const [customBrandId, productIds] of Object.entries(brandProducts)) {
      const brandObjectId = brandMap[customBrandId]._id;
      const brandLabel = brandMap[customBrandId].label;
      console.log(`   ${brandLabel}: ${productIds.length} products`);
    }

    for (const [customCategoryId, productIds] of Object.entries(categoryProducts)) {
      const categoryObjectId = categoryMap[customCategoryId]._id;
      const categoryLabel = categoryMap[customCategoryId].label;
      console.log(`   ${categoryLabel}: ${productIds.length} products`);
    }

    console.log("\n✨ Database seeded successfully!");
    console.log("\nNote: Products are linked to brands/categories by ObjectId references.");
    console.log("To query products by brand: Product.find({ brand: brandObjectId }).populate('brand')");
    console.log("To query products by category: Product.find({ category: categoryObjectId }).populate('category')");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();