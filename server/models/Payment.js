const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'khalti', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  transactionId: {
    type: String,
    sparse: true
  },
  gatewayTransactionId: {
    type: String,
    sparse: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: String,
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);