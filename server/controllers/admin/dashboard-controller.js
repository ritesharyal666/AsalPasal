const User = require("../../models/User");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Payment = require("../../models/Payment");
const PaymentLog = require("../../models/PaymentLog");

const getDashboardData = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Total orders - exclude rejected/cancelled orders
    const totalOrders = await Order.countDocuments({
      orderStatus: { $nin: ["rejected", "cancelled"] }
    });

    // Total earnings - only count COD earnings when order is delivered, exclude rejected/cancelled
    const totalEarningsResult = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["rejected", "cancelled"] }, // Exclude rejected/cancelled orders
          $or: [
            { paymentMethod: { $ne: "cod" } }, // Non-COD payments are counted immediately
            { 
              paymentMethod: "cod", 
              orderStatus: "delivered" 
            } // COD payments only when delivered
          ]
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;

    // Total profit - only calculate for orders that have generated earnings, exclude rejected/cancelled
    const profitOrders = await Order.find({
      orderStatus: { $nin: ["rejected", "cancelled"] },
      $or: [
        { paymentMethod: { $ne: "cod" } },
        { paymentMethod: "cod", orderStatus: "delivered" }
      ]
    }).populate('cartItems.productId');
    let totalProfit = 0;
    for (const order of profitOrders) {
      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (product && product.costPrice) {
          const profitPerItem = (parseFloat(item.price) - product.costPrice) * item.quantity;
          totalProfit += profitPerItem;
        }
      }
    }

    // Monthly data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Monthly orders - exclude rejected/cancelled orders
    const monthlyOrders = await Order.countDocuments({
      orderDate: { $gte: startOfMonth, $lt: endOfMonth },
      orderStatus: { $nin: ["rejected", "cancelled"] }
    });

    // Monthly earnings - only count COD earnings when order is delivered, exclude rejected/cancelled
    const monthlyEarningsResult = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startOfMonth, $lt: endOfMonth },
          orderStatus: { $nin: ["rejected", "cancelled"] }, // Exclude rejected/cancelled orders
          $or: [
            { paymentMethod: { $ne: "cod" } }, // Non-COD payments are counted immediately
            { 
              paymentMethod: "cod", 
              orderStatus: "delivered" 
            } // COD payments only when delivered
          ]
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const monthlyEarnings = monthlyEarningsResult.length > 0 ? monthlyEarningsResult[0].total : 0;

    // Monthly profit - only calculate for orders that have generated earnings, exclude rejected/cancelled
    const monthlyProfitOrders = await Order.find({
      orderDate: { $gte: startOfMonth, $lt: endOfMonth },
      orderStatus: { $nin: ["rejected", "cancelled"] },
      $or: [
        { paymentMethod: { $ne: "cod" } },
        { paymentMethod: "cod", orderStatus: "delivered" }
      ]
    }).populate('cartItems.productId');
    let monthlyProfit = 0;
    for (const order of monthlyProfitOrders) {
      for (const item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (product && product.costPrice) {
          const profitPerItem = (parseFloat(item.price) - product.costPrice) * item.quantity;
          monthlyProfit += profitPerItem;
        }
      }
    }

    // Cancelled/Rejected orders count
    const cancelledOrders = await Order.countDocuments({ orderStatus: "cancelled" });
    const rejectedOrders = await Order.countDocuments({ orderStatus: "rejected" });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalOrders,
        totalEarnings,
        totalProfit,
        monthlyOrders,
        monthlyEarnings,
        monthlyProfit,
        cancelledOrders,
        rejectedOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
};

const getDetailedPaymentLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, paymentMethod, userId, orderId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (userId) filter.userId = userId;
    if (orderId) filter.orderId = orderId;

    console.log("🔍 Payment Filter:", JSON.stringify(filter));
    console.log("📊 Querying Payment Collection...");

    // Get payments with populated user and order data
    const payments = await Payment.find(filter)
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'orderId',
        select: 'orderStatus totalAmount orderDate'
      })
      .sort({ paymentDate: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean()
      .exec();

    console.log(`💾 Payments Found: ${payments.length}`);
    if (payments.length > 0) {
      console.log("📄 Sample Payment:", JSON.stringify(payments[0], null, 2));
    }

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(filter);
    console.log(`📈 Total Payments in DB: ${totalPayments}`);
    
    const totalPages = Math.ceil(totalPayments / limitNum);

    // Transform the data to match frontend expectations
    const transformedPayments = payments.map(payment => ({
      _id: payment._id,
      orderId: payment.orderId?._id || payment.orderId,
      userId: payment.userId?._id || payment.userId,
      user: payment.userId ? {
        firstName: payment.userId.firstName,
        lastName: payment.userId.lastName,
        email: payment.userId.email
      } : null,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.paymentStatus,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt || payment.paymentDate
    }));

    console.log(`✅ Transformed ${transformedPayments.length} payments for response`);

    res.status(200).json({
      success: true,
      data: transformedPayments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalLogs: totalPayments,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      }
    });
  } catch (error) {
    console.error("❌ Error fetching detailed payment logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching detailed payment logs",
      error: error.message
    });
  }
};

const getPaymentLogsById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Get payment logs for the specific payment
    const paymentLogs = await PaymentLog.find({ paymentId })
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'orderId',
        select: 'orderStatus totalAmount orderDate'
      })
      .sort({ timestamp: 1 }) // Sort by timestamp ascending to show chronological order
      .exec();

    // Transform the logs for better readability
    const transformedLogs = paymentLogs.map(log => ({
      _id: log._id,
      timestamp: log.timestamp,
      action: log.action,
      status: log.status,
      paymentMethod: log.paymentMethod,
      amount: log.amount,
      currency: log.currency,
      user: log.userId ? {
        firstName: log.userId.firstName,
        lastName: log.userId.lastName,
        email: log.userId.email
      } : null,
      order: log.orderId ? {
        _id: log.orderId._id,
        status: log.orderId.orderStatus,
        totalAmount: log.orderId.totalAmount,
        orderDate: log.orderId.orderDate
      } : null,
      errorMessage: log.errorMessage,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }));

    res.status(200).json({
      success: true,
      data: transformedLogs
    });
  } catch (error) {
    console.error("Error fetching payment logs by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment logs",
    });
  }
};

const getPaymentAnalytics = async (req, res) => {
  try {
    // Total payments
    const totalPayments = await Payment.countDocuments();

    // Successful payments
    const successfulPayments = await Payment.countDocuments({ paymentStatus: 'completed' });

    // Failed payments
    const failedPayments = await Payment.countDocuments({ paymentStatus: 'failed' });

    // Pending payments
    const pendingPayments = await Payment.countDocuments({ paymentStatus: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        failedPayments,
        pendingPayments
      }
    });
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment analytics",
    });
  }
};

const getFailedPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const failedPayments = await Payment.find({ paymentStatus: 'failed' })
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'orderId',
        select: 'orderStatus totalAmount orderDate'
      })
      .sort({ paymentDate: -1 })
      .limit(limitNum)
      .skip(skip)
      .exec();

    const totalFailedPayments = await Payment.countDocuments({ paymentStatus: 'failed' });
    const totalPages = Math.ceil(totalFailedPayments / limitNum);

    // Format response with required fields
    const formattedPayments = failedPayments.map(payment => ({
      _id: payment._id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedPayments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalFailed: totalFailedPayments,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching failed payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching failed payments",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
  getPaymentAnalytics,
  getDetailedPaymentLogs,
  getPaymentLogsById,
  getFailedPayments,
};