const mongoose = require('mongoose');

const EvaluationResultSchema = new mongoose.Schema({
  planTitle: { type: String, required: true },
  testName: { type: String, default: '' },
  paperTag: { type: String, default: '' },
  studentEmail: { type: String, required: true, index: true }, // 'all' for course-wide result, or specific email e.g. student@itopper.com
  targetType: { type: String, enum: ['personal', 'course_all'], default: 'personal' },
  score: { type: String, default: '' },
  remarks: { type: String, default: '' },
  resultPdf: { type: String, required: true },
  evaluatedAt: { type: String, default: () => new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) }
}, { timestamps: true });

module.exports = mongoose.model('EvaluationResult', EvaluationResultSchema);
