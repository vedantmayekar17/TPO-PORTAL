const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Drive', required: true },

    name: { type: String, required: true },
    roll: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },

    status: {
      type: String,
      enum: ['Pending', 'Selected', 'Rejected', 'Placed'],
      default: 'Pending'
    },

    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Application ||
  mongoose.model('Application', ApplicationSchema);
