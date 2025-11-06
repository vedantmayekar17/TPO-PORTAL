const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, adminOnly } = require('../middlewares/auth');
const JWT_SECRET = process.env.JWT_SECRET;

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, roll, password } = req.body;
    const existingStudent = await Student.findOne({ $or: [{ email }, { roll }] });
    if (existingStudent) return res.json({ success: false, message: 'Email or Roll already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, roll, password: hashed });
    await student.save();
    res.json({ success: true, message: 'Signup successful!' });
  } catch (e) {
    res.json({ success: false, message: 'Signup error' });
  }
});

// Login
router.post('/students/login.', async (req, res) => {
  try {
    const { roll, password } = req.body;
    const student = await Student.findOne({ roll });
    if (!student) return res.json({ success: false, message: 'Invalid login' });
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.json({ success: false, message: 'Invalid login' });
    const token = jwt.sign({ id: student._id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, student });
  } catch (e) {
    res.json({ success: false, message: 'Login error' });
  }
});

// Profile update
router.put('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, branch, year, cgpa } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id, { name, email, branch, year, cgpa }, { new: true, runValidators: true }
    ).select('-password');
    if (!student) return res.json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (e) {
    res.json({ success: false, message: 'Update error' });
  }
});

// Admin: Get all students
router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (e) {
    res.json({ success: false, students: [] });
  }
});

module.exports = router;
