const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    default: 'Faculty Member',
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  classes: [{
    title: { type: String },
    date: { type: String },
    time: { type: String },
    link: { type: String },
    subject: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
