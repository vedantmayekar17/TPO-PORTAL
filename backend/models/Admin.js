const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    default: "admin"
  }
}, { timestamps: true });

// IMPORTANT:
// - Model name: "Admin" (singular, first argument)
// - Collection: "admins" (plural, third argument) to match your MongoDB collection exactly

module.exports = mongoose.model("Admin", AdminSchema, "admins");
