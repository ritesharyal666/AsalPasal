const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminDashboardRouter = require("./routes/admin/dashboard-routes");
const adminPaymentsRouter = require("./routes/admin/payments-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopRecommendRouter = require("./routes/shop/recommend-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");
const adminCategoryRouter = require("./routes/admin/category-routes");
const adminBrandRouter = require("./routes/admin/brand-routes");
const shopCategoryBrandRouter = require("./routes/shop/category-brand-routes");

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/admin/payments", adminPaymentsRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/recommend", shopRecommendRouter);

app.use("/api/common/feature", commonFeatureRouter);

app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/brands", adminBrandRouter);
app.use("/api/shop", shopCategoryBrandRouter);

const multer = require("multer");

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 5MB',
      });
    }
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files (JPEG, PNG, WEBP) are allowed',
    });
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));