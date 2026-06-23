const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// @route   GET /api/reviews/admin/all
// @desc    Get all reviews compiled from all courses
router.get('/admin/all', async (req, res) => {
  try {
    const courses = await Course.find().select('subject reviews');
    const flatReviews = [];
    courses.forEach(course => {
      course.reviews.forEach(review => {
        flatReviews.push({
          _id: review._id,
          courseId: course._id,
          courseName: course.subject,
          studentName: review.studentName,
          rating: review.rating,
          comment: review.comment,
          date: review.date
        });
      });
    });
    return res.json(flatReviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reviews/admin/:id
// @desc    Delete a review by ID
router.delete('/admin/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ "reviews._id": req.params.id });
    if (!course) {
      return res.status(404).json({ message: 'Review not found' });
    }

    course.reviews = course.reviews.filter(r => r._id.toString() !== req.params.id);
    await course.save();
    return res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting review' });
  }
});

// @route   PUT /api/reviews/admin/:id
// @desc    Update a review by ID
router.put('/admin/:id', async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const course = await Course.findOne({ "reviews._id": req.params.id });
    if (!course) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const review = course.reviews.id(req.params.id);
    if (rating !== undefined) review.rating = parseInt(rating);
    if (comment !== undefined) review.comment = comment;

    await course.save();
    return res.json(review);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating review' });
  }
});

module.exports = router;
