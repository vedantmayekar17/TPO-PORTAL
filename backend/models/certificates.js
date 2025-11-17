const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  studentId: String,
  type: String,
  title: String,
  issuer: String,
  date: Date,
  fileName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,
  uploadedAt: Date
});

module.exports = mongoose.model('Certificate', certificateSchema);
