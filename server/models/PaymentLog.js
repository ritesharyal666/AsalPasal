const mongoose = require("mongoose");

const PaymentLogSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['initiate', 'process', 'complete', 'fail', 'cancel', 'refund', 'verify'],
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'error', 'pending'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'khalti', 'cod']
  },
  amount: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed
  },
  errorMessage: String,
  errorCode: String,
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
PaymentLogSchema.index({ paymentId: 1 });
PaymentLogSchema.index({ orderId: 1 });
PaymentLogSchema.index({ userId: 1 });
PaymentLogSchema.index({ action: 1 });
PaymentLogSchema.index({ status: 1 });
PaymentLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model("PaymentLog", PaymentLogSchema);