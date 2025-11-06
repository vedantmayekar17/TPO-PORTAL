const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, adminOnly } = require('../middlewares/auth');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/create', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (await Admin.findOne({ $or: [{ username }, { email }] }))
      return res.json({ success: false, message: 'Admin already exists' });
    const admin = new Admin({ username, email, password: await bcrypt.hash(password, 10) });
    await admin.save();
    res.json({ success: true, message: 'Admin created' });
  } catch (e) {
    res.json({ success: false, message: 'Create error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.json({ success: false, message: 'Invalid login' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.json({ success: false, message: 'Invalid login' });
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, admin });
  } catch (e) {
    res.json({ success: false, message: 'Login error' });
  }
});

module.exports = router;
