const mongoose = require('mongoose');

const EvaluationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['GS', 'Optional', 'Combo'], 
    default: 'GS' 
  },
  paperTag: { type: String, default: '' },
  description: { type: String, default: '' },
  features: [{ type: String }],
  mrpPrice: { type: Number, default: 0 },
  finalPrice: { type: Number, default: 0 },
  duration: { type: String, default: '3 Months' },
  badge: { type: String, default: '' },
  purchaseUrl: { type: String, default: '/#contact' },
  planPdf: { type: String, default: '' },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Evaluation', EvaluationSchema);
