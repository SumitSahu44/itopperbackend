const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');

// @route   GET /api/evaluations
// @desc    Get all active/published evaluations (or all if query admin=true)
router.get('/', async (req, res) => {
  try {
    const { category, admin } = req.query;
    let filter = {};
    if (admin !== 'true') {
      filter.published = true;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    const list = await Evaluation.find(filter).sort({ order: 1, createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('Error fetching evaluations:', err);
    return res.status(500).json({ message: 'Server error fetching evaluation plans' });
  }
});

// @route   GET /api/evaluations/:id
// @desc    Get single evaluation plan by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Evaluation.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Evaluation plan not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/evaluations
// @desc    Create new evaluation plan
router.post('/', async (req, res) => {
  try {
    const { title, category, paperTag, description, features, mrpPrice, finalPrice, duration, badge, purchaseUrl, planPdf, published, order } = req.body;
    
    const newItem = new Evaluation({
      title,
      category: category || 'GS',
      paperTag: paperTag || '',
      description: description || '',
      features: Array.isArray(features) ? features : (features ? features.split('\n').filter(f => f.trim()) : []),
      mrpPrice: parseFloat(mrpPrice || 0),
      finalPrice: parseFloat(finalPrice || 0),
      duration: duration || '3 Months',
      badge: badge || '',
      purchaseUrl: purchaseUrl || '/#contact',
      planPdf: planPdf || '',
      published: published !== undefined ? published : true,
      order: parseInt(order || 0)
    });

    const saved = await newItem.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating evaluation plan:', err);
    return res.status(500).json({ message: 'Server error creating evaluation plan' });
  }
});

// @route   PUT /api/evaluations/:id
// @desc    Update evaluation plan
router.put('/:id', async (req, res) => {
  try {
    const item = await Evaluation.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Evaluation plan not found' });
    }

    const { title, category, paperTag, description, features, mrpPrice, finalPrice, duration, badge, purchaseUrl, planPdf, published, order } = req.body;

    if (title !== undefined) item.title = title;
    if (category !== undefined) item.category = category;
    if (paperTag !== undefined) item.paperTag = paperTag;
    if (description !== undefined) item.description = description;
    if (features !== undefined) {
      item.features = Array.isArray(features) ? features : features.split('\n').filter(f => f.trim());
    }
    if (mrpPrice !== undefined) item.mrpPrice = parseFloat(mrpPrice || 0);
    if (finalPrice !== undefined) item.finalPrice = parseFloat(finalPrice || 0);
    if (duration !== undefined) item.duration = duration;
    if (badge !== undefined) item.badge = badge;
    if (purchaseUrl !== undefined) item.purchaseUrl = purchaseUrl;
    if (planPdf !== undefined) item.planPdf = planPdf;
    if (published !== undefined) item.published = published;
    if (order !== undefined) item.order = parseInt(order || 0);

    const updated = await item.save();
    return res.json(updated);
  } catch (err) {
    console.error('Error updating evaluation plan:', err);
    return res.status(500).json({ message: 'Server error updating evaluation plan' });
  }
});

// @route   DELETE /api/evaluations/:id
// @desc    Delete evaluation plan
router.delete('/:id', async (req, res) => {
  try {
    const item = await Evaluation.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Evaluation plan not found' });
    }
    await item.deleteOne();
    return res.json({ message: 'Evaluation plan deleted successfully' });
  } catch (err) {
    console.error('Error deleting evaluation plan:', err);
    return res.status(500).json({ message: 'Server error deleting evaluation plan' });
  }
});

module.exports = router;
