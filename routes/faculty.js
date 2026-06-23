const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');

// @route   GET /api/faculty
// @desc    Get all faculty members
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password');
    return res.json(faculty);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching faculty' });
  }
});

// @route   GET /api/faculty/assignments
// @desc    Get all faculty and their assignments
router.get('/assignments', async (req, res) => {
  try {
    const faculty = await Faculty.find().select('name designation photo email classes');
    return res.json(faculty);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty/register
// @desc    Register a new faculty member
router.post('/register', async (req, res) => {
  const { name, email, password, designation, photo } = req.body;
  try {
    let faculty = await Faculty.findOne({ email });
    if (faculty) {
      return res.status(400).json({ message: 'Faculty member already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    faculty = new Faculty({
      name,
      email,
      password: hashedPassword,
      designation: designation || 'Faculty Member',
      photo: photo || ''
    });

    await faculty.save();
    return res.status(201).json({ message: 'Faculty registered successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error registering faculty' });
  }
});

// @route   POST /api/faculty/login
// @desc    Faculty login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: 'mock_faculty_token_jwt',
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        designation: faculty.designation
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete/Remove a faculty member
router.delete('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    await faculty.deleteOne();
    return res.json({ message: 'Faculty member removed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty/class
// @desc    Add a live class (for faculty member)
router.post('/class', async (req, res) => {
  const { facultyId, title, date, time, link, subject } = req.body;
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    faculty.classes.push({ title, date, time, link, subject });
    await faculty.save();
    return res.status(201).json(faculty.classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error adding class' });
  }
});

// @route   PUT /api/faculty/class/:id
// @desc    Update a class
router.put('/class/:id', async (req, res) => {
  const { facultyId, title, date, time, link, subject } = req.body;
  try {
    const faculty = await Faculty.findOne({ "classes._id": req.params.id });
    if (!faculty) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const classObj = faculty.classes.id(req.params.id);
    if (title !== undefined) classObj.title = title;
    if (date !== undefined) classObj.date = date;
    if (time !== undefined) classObj.time = time;
    if (link !== undefined) classObj.link = link;
    if (subject !== undefined) classObj.subject = subject;

    await faculty.save();
    return res.json(classObj);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating class' });
  }
});

// @route   GET /api/faculty/myclasses
// @desc    Get classes for a faculty member
router.get('/myclasses', async (req, res) => {
  const facultyId = req.query.facultyId;
  try {
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    return res.json(faculty.classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
