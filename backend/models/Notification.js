// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  target: {
    type: String,
    enum: ["all", "branch", "year", "specific"],
    default: "all"
  },
  branch: {
    type: String,
    default: null
  },
  year: {
    type: String,
    default: null
  },
  specificStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  sentBy: {
    type: String,
    default: "Admin"
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);
