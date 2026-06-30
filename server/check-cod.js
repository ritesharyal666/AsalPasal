const mongoose = require('mongoose');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const PaymentLog = require('./models/PaymentLog');

async function checkCODPayments() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mern-ecommerce-2024');

    // Find COD orders that are delivered
    const codOrders = await Order.find({
      paymentMethod: 'cod',
      orderStatus: 'delivered'
    });

    console.log('COD orders marked as delivered:', codOrders.length);

    for (const order of codOrders) {
      const payment = await Payment.findOne({ orderId: order._id });
      const paymentLogs = await PaymentLog.find({ orderId: order._id });

      console.log(`Order ${order._id}: Payment exists: ${!!payment}, PaymentLogs: ${paymentLogs.length}`);
      if (payment) {
        console.log(`  Payment amount: ${payment.amount}, status: ${payment.paymentStatus}`);
      }
    }

    // Also check for any COD orders
    const allCodOrders = await Order.find({ paymentMethod: 'cod' });
    console.log('Total COD orders:', allCodOrders.length);
    console.log('COD order statuses:', allCodOrders.map(o => o.orderStatus));

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCODPayments();