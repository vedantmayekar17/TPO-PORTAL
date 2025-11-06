const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  roll: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  branch: { type: String, default: 'AIML' },
  year: { type: String, default: '2nd Year' },
  cgpa: { type: String, default: '0.0' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
