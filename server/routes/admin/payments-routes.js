const express = require("express");
const { getPaymentAnalytics, getDetailedPaymentLogs, getPaymentLogsById, getFailedPayments } = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

router.get("/get", getPaymentAnalytics);
router.get("/logs", getDetailedPaymentLogs);
router.get("/logs/:paymentId", getPaymentLogsById);
router.get("/failed", getFailedPayments);

module.exports = router;