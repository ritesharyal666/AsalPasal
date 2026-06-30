const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Payment = require("../../models/Payment");
const PaymentLog = require("../../models/PaymentLog");
const { sendEmail } = require("../../helpers/email");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId');

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('userId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const previousStatus = order.orderStatus;

    // Update order status
    await Order.findByIdAndUpdate(id, { orderStatus });

    // Handle stock management
    // Decrease stock when order is confirmed/accepted (only for COD, online payments decrease on payment capture)
    if (order.paymentMethod === "cod" && previousStatus !== "confirmed" && orderStatus === "confirmed") {
      for (const item of order.cartItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalStock: -item.quantity } }
        );
      }
    }
    
    // Increase stock back when order is cancelled or rejected (for all payment methods)
    if ((previousStatus !== "cancelled" && orderStatus === "cancelled") || 
        (previousStatus !== "rejected" && orderStatus === "rejected")) {
      for (const item of order.cartItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalStock: item.quantity } }
        );
      }
    }

    // Create Payment record for COD orders when they become delivered or are already delivered
    if (order.paymentMethod === "cod" && (orderStatus === "delivered" || order.orderStatus === "delivered")) {
      // Check if payment already exists
      const existingPayment = await Payment.findOne({ orderId: order._id });
      if (!existingPayment) {
        const payment = new Payment({
          orderId: order._id,
          userId: order.userId,
          paymentMethod: 'cod',
          paymentStatus: 'completed',
          amount: order.totalAmount,
          currency: 'NPR', // COD payments in NPR
          transactionId: `COD-${order._id}-${Date.now()}`, // Generate unique transaction ID for COD
          paymentDate: new Date(),
          completedAt: new Date(),
          gatewayResponse: { 
            deliveryStatus: 'completed',
            deliveredAt: new Date(),
            paymentMethod: 'cod'
          }
        });

        await payment.save();

        // Create PaymentLog
        const paymentLog = new PaymentLog({
          paymentId: payment._id,
          userId: order.userId,
          orderId: order._id,
          action: 'complete',
          status: 'success',
          paymentMethod: 'cod',
          amount: order.totalAmount,
          currency: 'NPR',
          transactionId: payment.transactionId,
          timestamp: new Date()
        });

        await paymentLog.save();

        // Update order payment status to paid
        await Order.findByIdAndUpdate(order._id, { paymentStatus: 'paid' });

        console.log(`✅ COD Payment created for order ${order._id}: ${order.totalAmount} NPR`);
      }
    }

    // Send email notification
    const user = await User.findById(order.userId);
    if (user) {
      let subject = '';
      let html = '';
      if (orderStatus === 'confirmed') {
        subject = 'Order Confirmed';
        html = `<p>Hi ${user.firstName},</p><p>Your order #${order._id} has been confirmed.</p>`;
      } else if (orderStatus === 'inProcess') {
        subject = 'Order In Processing';
        html = `<p>Hi ${user.firstName},</p><p>Your order #${order._id} is now being processed.</p>`;
      } else if (orderStatus === 'shipped') {
        subject = 'Order Shipped';
        html = `<p>Hi ${user.firstName},</p><p>Your order #${order._id} has been shipped.</p>`;
      } else if (orderStatus === 'delivered') {
        subject = 'Order Delivered';
        html = `<p>Hi ${user.firstName},</p><p>Your order #${order._id} has been delivered successfully.</p>`;
      }
      if (subject) {
        await sendEmail(user.email, subject, html);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
