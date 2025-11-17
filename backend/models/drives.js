// backend/models/Drive.js
const mongoose = require('mongoose');

const DriveSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    ctc: { type: String, default: "-" },
    location: { type: String, default: "Remote" },
    deadline: { type: Date },
    driveDate: { type: Date },
    minCgpa: { type: String },
    eligibleBranches: { type: [String], default: [] },
    eligibleYears: { type: [String], default: [] },
    description: { type: String, default: "" },
    link: { type: String, default: "" },
    postedBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "companydrives" } // ✅ adds createdAt & updatedAt automatically
);

// ✅ model name = 'Drive', collection = 'companydrives'
module.exports = mongoose.model('Drive', DriveSchema, 'companydrives');
