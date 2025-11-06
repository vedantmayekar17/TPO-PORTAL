const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['Internship', 'Hackathon', 'Course', 'Workshop', 'Project', 'Award']
  },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: Date, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
