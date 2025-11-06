const express = require('express');
const router = express.Router();
const CompanyDrive = require('../models/CompanyDrive');
const { authenticateToken, adminOnly } = require('../middlewares/auth');

router.post('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const newDrive = new CompanyDrive(req.body);
    await newDrive.save();
    res.json({ success: true, drive: newDrive });
  } catch (e) {
    res.json({ success: false, message: 'Create error' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const drives = await CompanyDrive.find().sort({ createdAt: -1 });
    res.json({ success: true, drives });
  } catch (e) {
    res.json({ success: false, drives: [] });
  }
});

router.put('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const drive = await CompanyDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: !!drive, drive });
  } catch (e) {
    res.json({ success: false });
  }
});

router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    await CompanyDrive.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

module.exports = router;
