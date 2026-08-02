const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/blogs
// @desc    Get all blog posts (published & drafts)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching blogs' });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    return res.json(blog);
  } catch (err) {
    return res.status(404).json({ message: 'Blog post not found' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog post
router.post('/', protect, admin, async (req, res) => {
  const { title, category, readTime, excerpt, image, content, published, seoTitle, seoKeywords } = req.body;
  try {
    const newBlog = new Blog({
      title,
      category,
      readTime,
      excerpt,
      image,
      content,
      published: published !== undefined ? published : true,
      seoTitle: seoTitle || title,
      seoKeywords
    });

    const savedBlog = await newBlog.save();
    return res.status(201).json(savedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating blog' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update an existing blog post
router.put('/:id', protect, admin, async (req, res) => {
  const { title, category, readTime, excerpt, image, content, published, seoTitle, seoKeywords } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Update fields
    if (title !== undefined) blog.title = title;
    if (category !== undefined) blog.category = category;
    if (readTime !== undefined) blog.readTime = readTime;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (image !== undefined) blog.image = image;
    if (content !== undefined) blog.content = content;
    if (published !== undefined) blog.published = published;
    if (seoTitle !== undefined) blog.seoTitle = seoTitle;
    if (seoKeywords !== undefined) blog.seoKeywords = seoKeywords;

    const updatedBlog = await blog.save();
    return res.json(updatedBlog);
  } catch (err) {
    return res.status(404).json({ message: 'Blog post not found' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog post
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    await blog.deleteOne();
    return res.json({ message: 'Blog post removed successfully' });
  } catch (err) {
    return res.status(404).json({ message: 'Blog post not found' });
  }
});

module.exports = router;
