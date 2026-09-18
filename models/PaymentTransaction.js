const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    default: ''
  },
  signature: {
    type: String,
    default: ''
  },
  receipt: {
    type: String,
    default: ''
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  studentName: {
    type: String,
    default: 'Student'
  },
  studentEmail: {
    type: String,
    default: ''
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  itemType: {
    type: String,
    enum: ['Course', 'Evaluation', 'Other'],
    default: 'Course'
  },
  itemName: {
    type: String,
    default: 'Plan'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['CREATED', 'AUTHORIZED', 'PAID', 'VERIFIED', 'FAILED', 'REFUNDED'],
    default: 'CREATED'
  },
  fulfillmentStatus: {
    type: String,
    enum: ['PENDING', 'FULFILLED', 'FAILED', 'NOT_APPLICABLE'],
    default: 'PENDING'
  },
  refundId: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundStatus: {
    type: String,
    default: ''
  },
  refundReason: {
    type: String,
    default: ''
  },
  failureReason: {
    type: String,
    default: ''
  },
  notes: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
