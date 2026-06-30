const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  captureKhaltiPayment,
  getPaymentLogsByPaymentId,
  getPaymentLogsByOrderId,
  getPaymentLogsByUserId,
  getFailedPaymentsForUser,
  getPaymentDetails,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.post("/capture-khalti", captureKhaltiPayment); // New route for Khalti
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

// Payment endpoints
router.get("/payment/logs/:paymentId", getPaymentLogsByPaymentId);
router.get("/payment/order-logs/:orderId", getPaymentLogsByOrderId);
router.get("/payment/user-logs/:userId", getPaymentLogsByUserId);
router.get("/payment/failed", getFailedPaymentsForUser);
router.get("/payment/details/:paymentId", getPaymentDetails);

module.exports = router;