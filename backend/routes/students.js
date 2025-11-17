const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const csv = require('csvtojson');
const fs = require('fs');
const { authenticateToken, adminOnly } = require('../middlewares/auth');

// GET all students (admin only)
router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ success: true, students });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Student Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, roll, password } = req.body;
    const existing = await Student.findOne({ $or: [{ email }, { roll }] });
    if (existing) return res.json({ success: false, message: 'Email or Roll already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, roll, password: hashed });
    await student.save();
    res.json({ success: true, message: 'Signup successful!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Student Login
router.post('/login', async (req, res) => {
  try {
    const { roll, password } = req.body;
    const student = await Student.findOne({ roll });
    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign(
  {
    _id: student._id,  // add this
    id: student._id,   // keep this for backward compatibility
    role: 'student',
    name: student.name,
    email: student.email
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
    res.json({ success: true, token, student });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Get student profile (self or admin)
router.get('/:id', authenticateToken, async (req, res) => {
  if (req.user.role === 'admin' || req.user._id == req.params.id) {
    const student = await Student.findById(req.params.id);
    res.json({ success: true, student });
  } else {
    res.status(403).json({ success: false, message: 'Forbidden' });
  }
});

// Document upload (authenticated)
router.post('/:id/upload/:type', authenticateToken, upload.single('doc'), async (req, res) => {
  if (req.user.role !== 'admin' && req.user._id != req.params.id)
    return res.status(403).json({ success: false, message: 'Forbidden' });
  // Save uploaded path and update field in Student document here
  res.json({ success: true, message: 'Uploaded' });
});

// Delete a student (admin/self)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (req.user.role === 'admin' || req.user._id == req.params.id) {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: 'Forbidden' });
  }
});

// Admin verifies student document
router.post('/:id/verify/:type', authenticateToken, adminOnly, async (req, res) => {
  // Verification logic
  res.json({ success: true, message: 'Verified' });
});

// Bulk upload students (admin only, CSV)
router.post('/upload-sheet', authenticateToken, adminOnly, upload.single('sheet'), async (req, res) => {
  // CSV parsing and bulk insert logic
  res.json({ success: true, message: 'Bulk upload complete' });
});

module.exports = router;
