const paypal = require("../../helpers/paypal");
const khalti = require("../../helpers/khalti");
const { convertNPRToUSD } = require("../../helpers/currency");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Payment = require("../../models/Payment");
const PaymentLog = require("../../models/PaymentLog");
const { sendEmail, generateOrderConfirmationHTML } = require("../../helpers/email");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Handle PayPal Payment
    if (paymentMethod === "paypal") {
      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:5173/shop/paypal-return",
          cancel_url: "http://localhost:5173/shop/paypal-cancel",
        },
        transactions: [
          {
            item_list: {
              items: cartItems.map((item) => ({
                name: item.title,
                sku: item.productId,
                price: convertNPRToUSD(item.price).toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              })),
            },
            amount: {
              currency: "USD",
              total: convertNPRToUSD(totalAmount).toFixed(2),
            },
            description: "description",
          },
        ],
      };

      paypal.payment.create(
        create_payment_json,
        async (error, paymentInfo) => {
          if (error) {
            console.log(error);
            return res.status(500).json({
              success: false,
              message: "Error while creating paypal payment",
            });
          } else {
            const newlyCreatedOrder = new Order({
              userId,
              cartId,
              cartItems,
              addressInfo,
              orderStatus,
              paymentMethod,
              paymentStatus,
              totalAmount,
              orderDate,
              orderUpdateDate,
              paymentId,
              payerId,
            });

            await newlyCreatedOrder.save();

            const approvalURL = paymentInfo.links.find(
              (link) => link.rel === "approval_url"
            ).href;

            res.status(201).json({
              success: true,
              approvalURL,
              orderId: newlyCreatedOrder._id,
            });
          }
        }
      );
    }
    // Handle Khalti Payment
    else if (paymentMethod === "khalti") {
      // Create order first
      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus,
        paymentMethod,
        paymentStatus,
        totalAmount,
        orderDate,
        orderUpdateDate,
        paymentId: "",
        payerId: "",
      });

      await newlyCreatedOrder.save();

      // Initiate Khalti payment
      const khaltiResponse = await khalti.initiatePayment({
        orderId: newlyCreatedOrder._id.toString(),
        amount: totalAmount,
        customerName: addressInfo.address,
        customerEmail: "customer@example.com",
        customerPhone: addressInfo.phone,
        returnUrl: "http://localhost:5173/shop/khalti-return",
        websiteUrl: "http://localhost:5173",
      });

      if (khaltiResponse.success) {
        // Update order with Khalti pidx
        newlyCreatedOrder.paymentId = khaltiResponse.data.pidx;
        await newlyCreatedOrder.save();

        res.status(201).json({
          success: true,
          approvalURL: khaltiResponse.data.payment_url,
          orderId: newlyCreatedOrder._id,
          khaltiData: khaltiResponse.data,
        });
      } else {
        // Delete order if Khalti initiation fails
        await Order.findByIdAndDelete(newlyCreatedOrder._id);

        res.status(500).json({
          success: false,
          message: "Error while creating Khalti payment",
          error: khaltiResponse.error,
        });
      }
    }
    // Handle Cash on Delivery
    else if (paymentMethod === "cod") {
      // Check stock availability before creating COD order
      for (const item of cartItems) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.title}`,
          });
        }

        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: ${product.title}. Available: ${product.totalStock}, Required: ${item.quantity}`,
          });
        }
      }

      const newlyCreatedOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "confirmed",
        paymentMethod,
        paymentStatus: "pending",
        totalAmount,
        orderDate,
        orderUpdateDate,
        paymentId: "",
        payerId: "",
      });

      await newlyCreatedOrder.save();

      // Decrease stock for COD orders immediately when confirmed
      for (const item of cartItems) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalStock: -item.quantity } }
        );
      }

      // Delete cart after COD order is placed
      await Cart.findByIdAndDelete(cartId);

      // Send order confirmation email
      const user = await User.findById(userId);
      if (user) {
        const subject = 'Order Confirmed - Your Order Details';
        const html = generateOrderConfirmationHTML(newlyCreatedOrder, user);
        await sendEmail(user.email, subject, html);
      }

      res.status(201).json({
        success: true,
        orderId: newlyCreatedOrder._id,
        message: "Order placed successfully with Cash on Delivery",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    // Check stock availability and decrease stock for online payments
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.title}`,
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for product: ${product.title}. Available: ${product.totalStock}, Required: ${item.quantity}`,
        });
      }

      // Decrease stock using atomic operation
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { totalStock: -item.quantity } }
      );
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    // Create Payment record
    const payment = new Payment({
      orderId: order._id,
      userId: order.userId,
      paymentMethod: order.paymentMethod,
      paymentStatus: 'completed',
      amount: order.totalAmount,
      currency: 'USD', // PayPal uses USD
      transactionId: paymentId,
      gatewayTransactionId: payerId,
      paymentDate: new Date(),
      completedAt: new Date(),
      gatewayResponse: { paymentId, payerId }
    });

    await payment.save();

    // Create PaymentLog
    const paymentLog = new PaymentLog({
      paymentId: payment._id,
      userId: order.userId,
      orderId: order._id,
      action: 'complete',
      status: 'success',
      paymentMethod: order.paymentMethod,
      amount: order.totalAmount,
      currency: 'USD',
      transactionId: paymentId,
      timestamp: new Date()
    });

    await paymentLog.save();

    // Send order confirmation email
    const user = await User.findById(order.userId);
    if (user) {
      const subject = 'Order Confirmed - Your Order Details';
      const html = generateOrderConfirmationHTML(order, user);
      await sendEmail(user.email, subject, html);
    }

    res.status(200).json({
      success: true,
      message: "Order confirmed",
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

// New function for Khalti payment verification
const captureKhaltiPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;

    if (!pidx || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID (pidx) and Order ID are required",
      });
    }

    // Find order
    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify payment with Khalti
    const verificationResponse = await khalti.verifyPayment(pidx);

    if (!verificationResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment with Khalti",
        error: verificationResponse.error,
      });
    }

    const paymentData = verificationResponse.data;

    // Check if payment is completed
    if (paymentData.status === "Completed") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.payerId = paymentData.transaction_id;

      // Check stock availability and decrease stock for Khalti payments
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.title}`,
          });
        }

        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: ${product.title}. Available: ${product.totalStock}, Required: ${item.quantity}`,
          });
        }

        // Decrease stock using atomic operation
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalStock: -item.quantity } }
        );
      }

      // Delete cart
      const getCartId = order.cartId;
      await Cart.findByIdAndDelete(getCartId);

      await order.save();

      // Create Payment record
      const payment = new Payment({
        orderId: order._id,
        userId: order.userId,
        paymentMethod: order.paymentMethod,
        paymentStatus: 'completed',
        amount: order.totalAmount,
        currency: 'NPR', // Khalti uses NPR
        transactionId: paymentData.transaction_id,
        gatewayTransactionId: pidx,
        paymentDate: new Date(),
        completedAt: new Date(),
        gatewayResponse: paymentData
      });

      await payment.save();

      // Create PaymentLog
      const paymentLog = new PaymentLog({
        paymentId: payment._id,
        userId: order.userId,
        orderId: order._id,
        action: 'complete',
        status: 'success',
        paymentMethod: order.paymentMethod,
        amount: order.totalAmount,
        currency: 'NPR',
        transactionId: paymentData.transaction_id,
        timestamp: new Date()
      });

      await paymentLog.save();

      // Send order confirmation email
      const user = await User.findById(order.userId);
      if (user) {
        const subject = 'Order Confirmed - Your Order Details';
        const html = generateOrderConfirmationHTML(order, user);
        await sendEmail(user.email, subject, html);
      }

      return res.status(200).json({
        success: true,
        message: "Khalti payment verified and order confirmed",
        data: order,
      });
    } else if (
      paymentData.status === "Pending" ||
      paymentData.status === "Initiated"
    ) {
      return res.status(200).json({
        success: false,
        message: "Payment is still pending",
        status: paymentData.status,
      });
    } else {
      // Payment failed, expired, or canceled - mark order as cancelled
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      await order.save();

      return res.status(400).json({
        success: false,
        message: `Payment ${paymentData.status}`,
        status: paymentData.status,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error verifying Khalti payment",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

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

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

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

// Get payment logs by payment ID
const getPaymentLogsByPaymentId = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { limit = 50 } = req.query;

    const paymentLogs = await PaymentLog.find({ paymentId })
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderStatus totalAmount orderDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    if (!paymentLogs || paymentLogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment logs not found",
      });
    }

    res.status(200).json({
      success: true,
      data: paymentLogs,
    });
  } catch (error) {
    console.error("Error fetching payment logs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment logs",
      error: error.message,
    });
  }
};

// Get payment logs by order ID
const getPaymentLogsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const paymentLogs = await PaymentLog.find({ orderId })
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderStatus totalAmount orderDate')
      .sort({ createdAt: -1 });

    if (!paymentLogs || paymentLogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment logs not found for this order",
      });
    }

    res.status(200).json({
      success: true,
      data: paymentLogs,
    });
  } catch (error) {
    console.error("Error fetching payment logs by order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment logs",
      error: error.message,
    });
  }
};

// Get payment logs by user ID
const getPaymentLogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const paymentLogs = await PaymentLog.find({ userId })
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderStatus totalAmount orderDate')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalLogs = await PaymentLog.countDocuments({ userId });
    const totalPages = Math.ceil(totalLogs / limitNum);

    res.status(200).json({
      success: true,
      data: paymentLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalLogs,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching payment logs by user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment logs",
      error: error.message,
    });
  }
};

// Get failed payments for shop user
const getFailedPaymentsForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const { limit = 50, page = 1 } = req.query;

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const filter = { status: 'failed' };
    if (userId) {
      filter.userId = userId;
    }

    const failedPayments = await PaymentLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderStatus totalAmount orderDate')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const totalFailed = await PaymentLog.countDocuments(filter);
    const totalPages = Math.ceil(totalFailed / limitNum);

    res.status(200).json({
      success: true,
      data: failedPayments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalFailed,
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

// Get payment details by payment ID
const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderStatus totalAmount orderDate');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Format response with required fields
    const formattedPayment = {
      _id: payment._id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
    };

    res.status(200).json({
      success: true,
      data: formattedPayment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment details",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  captureKhaltiPayment,
  getAllOrdersByUser,
  getOrderDetails,
  getPaymentLogsByPaymentId,
  getPaymentLogsByOrderId,
  getPaymentLogsByUserId,
  getFailedPaymentsForUser,
  getPaymentDetails,
};