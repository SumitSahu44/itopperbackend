const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: [{
    text: { type: String, default: '' }
  }]
});

const ModuleSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  lectures: [LectureSchema]
});

const MentorSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default: '' },
  designation: { type: String, default: '' },
  photo: { type: String, default: '' }
});

const CourseReviewSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  comment: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  level: { type: String, default: 'Beginner' },
  mrpPrice: { type: Number, default: 0 },
  finalPrice: { type: Number, default: 0 },
  demoVideo: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  brochure: { type: String, default: '' },
  modules: [ModuleSchema],
  mentors: [MentorSchema],
  reviews: [CourseReviewSchema],
  roadmapImage: { type: String, default: '' },
  skillsImages: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
