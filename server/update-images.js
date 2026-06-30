const mongoose = require("mongoose");
const Product = require("./models/Product");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const updateImageUrls = async () => {
  try {
    const products = await Product.find({ image: { $regex: /^\/uploads\// } });

    for (const product of products) {
      const filename = product.image.replace('/uploads/', '');
      const fullUrl = `http://localhost:5000/uploads/${filename}`;
      product.image = fullUrl;
      await product.save();
      console.log(`Updated product ${product.title}: ${product.image}`);
    }

    console.log("All image URLs updated successfully");
  } catch (error) {
    console.log("Error updating image URLs:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateImageUrls();