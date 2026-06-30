const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
  try {
    const { productId, reviewMessage, reviewValue } = req.body;
    const { id: userId, userName } = req.user;

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: { $in: ["confirmed", "delivered"] },
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase product to review it.",
      });
    }

    const checkExistinfReview = await ProductReview.findOne({
      productId,
      userId,
    });

    if (checkExistinfReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    const reviews = await ProductReview.find({ productId });
    const totalReviewsLength = reviews.length;
    const averageReview =
      reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
      totalReviewsLength;

    await Product.findByIdAndUpdate(productId, { averageReview });

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await ProductReview.find({ productId });
    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const editProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reviewMessage, reviewValue } = req.body;
    const { id: userId } = req.user;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this review" });
    }

    review.reviewMessage = reviewMessage ?? review.reviewMessage;
    review.reviewValue = typeof reviewValue === 'number' ? reviewValue : review.reviewValue;

    await review.save();

    // Recalculate average for product
    const reviews = await ProductReview.find({ productId: review.productId });
    const totalReviewsLength = reviews.length;
    const averageReview = totalReviewsLength
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / totalReviewsLength
      : 0;

    await Product.findByIdAndUpdate(review.productId, { averageReview });

    res.status(200).json({ success: true, data: review });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const deleteProductReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { id: userId } = req.user;

    const review = await ProductReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    const productId = review.productId;
    await review.remove();

    // Recalculate average for product after deletion
    const reviews = await ProductReview.find({ productId });
    const totalReviewsLength = reviews.length;
    const averageReview = totalReviewsLength
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / totalReviewsLength
      : 0;

    await Product.findByIdAndUpdate(productId, { averageReview });

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = { addProductReview, getProductReviews, editProductReview, deleteProductReview };
