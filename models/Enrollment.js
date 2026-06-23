const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  pricePaid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
    default: 'Active'
  },
  paymentId: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
