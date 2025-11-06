const mongoose = require('mongoose');

const companyDriveSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  ctc: { type: String },
  location: { type: String },
  deadline: { type: Date },
  driveDate: { type: Date },
  minCgpa: { type: String },
  eligibleBranches: { type: [String], default: [] },
  eligibleYears: { type: [String], default: [] },
  description: { type: String },
  poster: { type: String },
  link: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CompanyDrive', companyDriveSchema);
