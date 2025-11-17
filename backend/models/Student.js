const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },  // hashed password recommended

  roll: { type: String },
  branch: { type: String },
  year: { type: String },
  cgpa: { type: String },

  phone: { type: String },
  address: { type: String },
  skills: { type: [String], default: [] },

  // ✅ Passport size photo upload
  profilePhoto: {
    type: String, // Stored filename, example: "uploads/profile_123.jpg"
    default: ""
  },

  // ✅ Resume Upload
  resume: {
    type: String, // PDF or docx path
    default: ""
  },

  // ✅ Registered companies applied to (optional quick tracking)
  applications: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Application" }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", StudentSchema);
