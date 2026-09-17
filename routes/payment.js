const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TbVfSTdE3of9kw',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '0ojNxHrUBsUPDjZq7bdYKri0'
  });
};

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const razorpay = getRazorpayInstance();
    // Razorpay accepts amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_live_TbVfSTdE3of9kw'
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    return res.status(500).json({ message: 'Failed to create payment order', error: err.message });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay Signature & Save Enrollment if courseId provided
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      studentId,
      studentName,
      studentEmail,
      pricePaid
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay signature parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '0ojNxHrUBsUPDjZq7bdYKri0';
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid Signature', success: false });
    }

    let enrollment = null;
    if (courseId && (studentId || req.user)) {
      const course = await Course.findById(courseId);
      if (course) {
        const sId = studentId || (req.user ? req.user._id : null);
        const sName = studentName || (req.user ? req.user.name : 'Student');
        const sEmail = studentEmail || (req.user ? req.user.email : '');

        if (sId) {
          const existing = await Enrollment.findOne({ studentId: sId, courseId });
          if (!existing) {
            enrollment = new Enrollment({
              studentId: sId,
              studentName: sName,
              studentEmail: sEmail,
              courseId: course._id,
              courseName: course.subject,
              pricePaid: parseFloat(pricePaid || 0),
              paymentId: razorpay_payment_id,
              status: 'Active'
            });
            await enrollment.save();
          } else {
            enrollment = existing;
          }
        }
      }
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      enrollment
    });
  } catch (err) {
    console.error('Error verifying Razorpay payment:', err);
    return res.status(500).json({ message: 'Server error verifying payment', error: err.message });
  }
});

module.exports = router;
