const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// @route   GET /api/coupons/all
// @desc    Get all coupons
router.get('/all', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json(coupons);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/coupons/create
// @desc    Create a new coupon
router.post('/create', async (req, res) => {
  const { code, discountValue, minPurchase, expiryDate, discountType } = req.body;
  try {
    let coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (coupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    coupon = new Coupon({
      code: code.toUpperCase(),
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase || 0),
      expiryDate: new Date(expiryDate),
      discountType: discountType || 'percentage'
    });

    await coupon.save();
    return res.status(201).json(coupon);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    await coupon.deleteOne();
    return res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/coupons/validate
// @desc    Validate coupon code
router.post('/validate', async (req, res) => {
  const { code, cartTotal } = req.body;
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive coupon code' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon code has expired' });
    }

    if (cartTotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (coupon.discountValue / 100) * cartTotal;
    } else {
      discountAmount = coupon.discountValue;
    }

    return res.json({
      success: true,
      discountValue: coupon.discountValue,
      discountType: coupon.discountType,
      discountAmount: parseFloat(discountAmount.toFixed(2))
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
