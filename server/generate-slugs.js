const mongoose = require("mongoose");
const Product = require("./models/Product");

// Simple slugify function
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

const generateSlugs = async () => {
  try {
    const products = await Product.find({ slug: { $exists: false } });

    for (const product of products) {
      let baseSlug = slugify(product.title);
      let slug = baseSlug;
      let counter = 1;

      // Ensure uniqueness
      while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      product.slug = slug;
      await product.save();
      console.log(`Generated slug for ${product.title}: ${slug}`);
    }

    console.log("Slug generation completed");
  } catch (error) {
    console.log("Error generating slugs:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to MongoDB and run
mongoose.connect(process.env.MONGO_URI || "your_mongo_connection_string")
  .then(() => {
    console.log("Connected to MongoDB");
    generateSlugs();
  })
  .catch(err => console.log("MongoDB connection error:", err));