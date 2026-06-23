require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('./models/User');
const Blog = require('./models/Blog');
const Course = require('./models/Course');
const Faculty = require('./models/Faculty');

// Import Routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const courseRoutes = require('./routes/courses');
const facultyRoutes = require('./routes/faculty');
const couponRoutes = require('./routes/coupons');
const enrollmentRoutes = require('./routes/enrollments');
const reviewRoutes = require('./routes/reviews');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder for Uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);

// Additional Mock Payment Endpoints
app.post('/api/create-payment', (req, res) => {
  return res.json({
    id: 'pay_' + Math.random().toString(36).substring(2, 11),
    status: 'success',
    amount: req.body.amount || 0,
    message: 'Mock payment created successfully'
  });
});

app.post('/api/certificate/send', (req, res) => {
  return res.json({ message: 'Certificate generated and emailed successfully!' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('iTopper API Server is Running...');
});

// Seed Initial Database Data
const seedDatabase = async () => {
  try {
    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'tds@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'tds@1230';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new User({
        email: adminEmail,
        password: hashedAdminPassword,
        name: 'iTopper Admin',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Default Admin user seeded successfully.');
    }

    // 2. Seed Default Blog (Clears other blogs to keep only this single blog)
    await Blog.deleteMany({});
    const defaultBlog = new Blog({
      title: 'UPSC Prelims GS Paper I 2026 Out, Download PDF Now',
      category: 'Updates',
      readTime: '3 min read',
      excerpt: 'The UPSC Prelims GS Paper I 2026 question paper is now available. Download the PDF and check the complete paper analysis and expected cut-off.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
      published: true,
      content: `
        <div class="space-y-6 text-slate-700">
          <p class="text-lg leading-relaxed">The Union Public Service Commission (UPSC) has successfully conducted the Civil Services Preliminary Examination 2026 - General Studies Paper I today.</p>
          
          <h3 class="text-2xl font-bold text-[#163F66] mt-8">Download Question Paper</h3>
          <p class="leading-relaxed">Candidates and future aspirants can download the official question paper PDF from the link below to analyze the trends and difficulty level.</p>
          
          <div class="my-8 p-6 bg-blue-50 border-l-4 border-[#EF961D] rounded-r-xl">
              <p class="font-bold text-[#163F66] mb-2">UPSC CSE Prelims 2026 - GS Paper I</p>
              <a href="#" class="inline-block bg-[#EF961D] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d8871a] transition-colors">Download PDF Here</a>
          </div>
          
          <h3 class="text-2xl font-bold text-[#163F66] mt-8">Paper Analysis & Expected Cut-off</h3>
          <p class="leading-relaxed">A detailed analysis of the paper along with the answer key and expected cut-off will be updated shortly by our expert faculty. Stay tuned!</p>
        </div>
      `,
      seoTitle: 'UPSC Prelims GS Paper I 2026 PDF | iTopper Analysis',
      seoKeywords: 'upsc, prelims 2026, question paper, gs paper 1, upsc cut-off'
    });
    await defaultBlog.save();
    console.log('✅ Default blog post seeded successfully.');

    // 3. Seed Default Faculty
    const existingFaculty = await Faculty.find();
    if (existingFaculty.length === 0) {
      const defaultFaculty = new Faculty({
        name: 'Dr. Amit Kumar',
        email: 'amit@faculty.com',
        password: await bcrypt.hash('faculty123', 10),
        designation: 'Senior IAS Mentor',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        classes: [
          {
            title: 'Mains Answer Writing Strategy',
            date: '2026-06-25',
            time: '18:00',
            link: 'https://zoom.us/mock-link',
            subject: 'Essay & GS mains'
          }
        ]
      });
      await defaultFaculty.save();
      console.log('✅ Default faculty member seeded successfully.');
    }

    // 4. Seed Default Course
    const existingCourses = await Course.find();
    if (existingCourses.length === 0) {
      const firstFaculty = await Faculty.findOne();
      const defaultCourse = new Course({
        subject: 'UPSC Mains Answer Writing Masterclass',
        description: 'Learn the secrets of GS and Essay answer writing from senior educators and rankers. Daily evaluation included.',
        duration: '3 Months',
        level: 'Intermediate',
        mrpPrice: 15000,
        finalPrice: 8999,
        demoVideo: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400',
        modules: [
          {
            title: 'Module 1: Introduction to Mains Assessment',
            lectures: [
              { title: 'Lecture 1.1: What examiners look for', content: [{ text: 'Understand core expectations and marking criteria.' }] },
              { title: 'Lecture 1.2: Structure of a perfect answer', content: [{ text: 'Introduction, Body and Conclusion frameworks.' }] }
            ]
          }
        ],
        mentors: [
          {
            facultyId: firstFaculty ? firstFaculty._id : null,
            name: firstFaculty ? firstFaculty.name : 'Dr. Amit Kumar',
            designation: firstFaculty ? firstFaculty.designation : 'Senior IAS Mentor',
            photo: firstFaculty ? firstFaculty.photo : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
          }
        ],
        reviews: [
          { studentName: 'Vikas Dubey', rating: 5, comment: 'Changed the way I approach GS answer structure completely!' }
        ]
      });
      await defaultCourse.save();
      console.log('✅ Default Course seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
};

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/itopperr';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('🌿 Connected to MongoDB Database successfully.');
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });
