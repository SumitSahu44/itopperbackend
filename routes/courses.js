const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Course = require('../models/Course');

// Multer Config for File Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'brochure', maxCount: 1 },
  { name: 'roadmapImage', maxCount: 1 },
  { name: 'skillsImages', maxCount: 10 }
]);

// @route   GET /api/courses
// @desc    Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json(courses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching courses' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.json(course);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.status(500).json({ message: 'Server error fetching course details' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course (Form Data)
router.post('/', uploadFields, async (req, res) => {
  try {
    const { subject, description, duration, level, mrpPrice, finalPrice, demoVideo } = req.body;
    
    // Parse JSON fields
    const modules = req.body.modules ? JSON.parse(req.body.modules) : [];
    const reviews = req.body.reviews ? JSON.parse(req.body.reviews) : [];
    
    // Parse Mentors
    const mentorsCount = parseInt(req.body.mentorsCount || 0);
    const mentors = [];
    for (let i = 0; i < mentorsCount; i++) {
      const name = req.body[`mentorName_${i}`];
      const designation = req.body[`mentorDesignation_${i}`];
      const facultyId = req.body[`mentorFacultyId_${i}`];
      const photoUrl = req.body[`mentorPhotoUrl_${i}`];
      
      let photo = photoUrl || '';
      
      mentors.push({
        facultyId: facultyId || null,
        name: name || '',
        designation: designation || '',
        photo: photo
      });
    }

    // Handle Uploaded Files
    let thumbnail = '';
    if (req.files && req.files['thumbnail']) {
      thumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
    }

    let brochure = '';
    if (req.files && req.files['brochure']) {
      brochure = `/uploads/${req.files['brochure'][0].filename}`;
    }

    let roadmapImage = '';
    if (req.files && req.files['roadmapImage']) {
      roadmapImage = `/uploads/${req.files['roadmapImage'][0].filename}`;
    }

    const skillsImages = [];
    if (req.files && req.files['skillsImages']) {
      req.files['skillsImages'].forEach(file => {
        skillsImages.push(`/uploads/${file.filename}`);
      });
    }

    const newCourse = new Course({
      subject,
      description,
      duration,
      level,
      mrpPrice: parseFloat(mrpPrice || 0),
      finalPrice: parseFloat(finalPrice || 0),
      demoVideo,
      thumbnail,
      brochure,
      modules,
      mentors,
      reviews,
      roadmapImage,
      skillsImages
    });

    const savedCourse = await newCourse.save();
    return res.status(201).json(savedCourse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error creating course' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course by ID (Form Data)
router.put('/:id', uploadFields, async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const { subject, description, duration, level, mrpPrice, finalPrice, demoVideo } = req.body;

    if (subject !== undefined) course.subject = subject;
    if (description !== undefined) course.description = description;
    if (duration !== undefined) course.duration = duration;
    if (level !== undefined) course.level = level;
    if (mrpPrice !== undefined) course.mrpPrice = parseFloat(mrpPrice || 0);
    if (finalPrice !== undefined) course.finalPrice = parseFloat(finalPrice || 0);
    if (demoVideo !== undefined) course.demoVideo = demoVideo;

    if (req.body.modules) {
      course.modules = JSON.parse(req.body.modules);
    }
    if (req.body.reviews) {
      course.reviews = JSON.parse(req.body.reviews);
    }

    // Mentors
    if (req.body.mentorsCount !== undefined) {
      const mentorsCount = parseInt(req.body.mentorsCount || 0);
      const mentors = [];
      for (let i = 0; i < mentorsCount; i++) {
        const name = req.body[`mentorName_${i}`];
        const designation = req.body[`mentorDesignation_${i}`];
        const facultyId = req.body[`mentorFacultyId_${i}`];
        const photoUrl = req.body[`mentorPhotoUrl_${i}`];
        mentors.push({
          facultyId: facultyId || null,
          name: name || '',
          designation: designation || '',
          photo: photoUrl || ''
        });
      }
      course.mentors = mentors;
    }

    // Uploaded files check
    if (req.files) {
      if (req.files['thumbnail']) {
        course.thumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
      }
      if (req.files['brochure']) {
        course.brochure = `/uploads/${req.files['brochure'][0].filename}`;
      }
      if (req.files['roadmapImage']) {
        course.roadmapImage = `/uploads/${req.files['roadmapImage'][0].filename}`;
      }
      if (req.files['skillsImages']) {
        const newSkills = [];
        req.files['skillsImages'].forEach(file => {
          newSkills.push(`/uploads/${file.filename}`);
        });
        course.skillsImages = newSkills;
      }
    }

    const updatedCourse = await course.save();
    return res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating course' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    await course.deleteOne();
    return res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting course' });
  }
});

// @route   POST /api/courses/:id/review
// @desc    Add review to a course
router.post('/:id/review', async (req, res) => {
  const { studentName, rating, comment } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.reviews.push({
      studentName,
      rating: parseInt(rating || 5),
      comment
    });

    await course.save();
    return res.json(course);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error adding review' });
  }
});

// Mock/Placeholder for Quizzes and Results to prevent Admin Dashboard errors
router.get('/:id/quizzes', (req, res) => {
  return res.json([
    { _id: 'q1', title: 'UPSC CSE Syllabus Quiz', totalQuestions: 15 },
    { _id: 'q2', title: 'Weekly Current Affairs Mock', totalQuestions: 20 }
  ]);
});

router.get('/results/:quizId', (req, res) => {
  return res.json([
    {
      _id: 'r1',
      studentName: 'Rahul Sharma',
      score: 18,
      totalQuestions: 20,
      submittedAt: new Date().toISOString(),
      answerSheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      _id: 'r2',
      studentName: 'Priya Patel',
      score: 14,
      totalQuestions: 20,
      submittedAt: new Date().toISOString(),
      answerSheetUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]);
});

module.exports = router;
