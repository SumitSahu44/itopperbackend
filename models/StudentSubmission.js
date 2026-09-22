const mongoose = require('mongoose');

const StudentSubmissionSchema = new mongoose.Schema({
  planId: { type: String, required: true },
  planTitle: { type: String, required: true },
  testId: { type: String, required: true },
  testName: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileSize: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: String, default: () => new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) },
  status: { type: String, enum: ['Under Evaluation', 'Checked / Evaluated'], default: 'Under Evaluation' }
}, { timestamps: true });

module.exports = mongoose.model('StudentSubmission', StudentSubmissionSchema);
