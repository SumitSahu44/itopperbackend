const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.Mixed,
    default: 'guest_student'
  },
  studentName: {
    type: String,
    default: 'Student'
  },
  studentEmail: {
    type: String,
    default: 'student@itopper.com'
  },
  courseId: {
    type: mongoose.Schema.Types.Mixed,
    default: 'general_course'
  },
  courseName: {
    type: String,
    default: 'iTopper Course'
  },
  pricePaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Active'
  },
  paymentId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
