const mongoose = require("mongoose");

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

const ProductSchema = new mongoose.Schema(
  {
    images: [String], // Changed from single image to array of images
    title: String,
    description: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true
    },
    price: Number,
    salePrice: Number,
    costPrice: Number, // Added cost price for profit calculation
    totalStock: Number,
    averageReview: Number,
    slug: { type: String, unique: true }, // Added slug field
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug
ProductSchema.pre('save', async function(next) {
  if (this.isModified('title') || this.isNew) {
    let baseSlug = slugify(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure uniqueness
    while (await mongoose.models.Product.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
