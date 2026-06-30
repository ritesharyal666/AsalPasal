const express = require("express");
const { getDashboardData, getPaymentAnalytics } = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

router.get("/get", getDashboardData);
router.get("/payments/analytics", getPaymentAnalytics);

module.exports = router;