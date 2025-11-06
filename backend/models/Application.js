const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  name: String,
  roll: String,
  branch: String,
  year: String,
  cgpa: String,
  company: String,
  jobRole: String,
  ctc: String,
  status: { type: String, default: 'Applied' },
  interviewDate: Date,
  remarks: String,
  appliedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
