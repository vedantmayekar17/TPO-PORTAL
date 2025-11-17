const express = require('express');
const router = express.Router();

const Drive = require('../models/drives');
const Application = require('../models/Application');

// ✅ Import Authentication Middlewares
const { authenticateToken, adminOnly } = require('../middlewares/auth.js');

// ============================
// GET all drives
// ============================
router.get('/', async (req, res) => {
  try {
    const drives = await Drive.find().sort({ createdAt: -1 });
    res.json({ success: true, drives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// GET APPLICANTS OF A DRIVE (ADMIN ONLY)
// ============================
router.get('/:id/applicants', authenticateToken, adminOnly, async (req, res) => {
  try {
    const driveId = req.params.id;

    const apps = await Application.find({ driveId })
      .populate('studentId', 'name roll email phone')
      .sort({ createdAt: -1 });

    const applicants = apps.map(a => ({
      applicationId: a._id,
      studentId: a.studentId?._id,
      name: a.studentId?.name,
      roll: a.studentId?.roll,
      email: a.studentId?.email,
      phone: a.studentId?.phone,
      status: a.status,
      appliedOn: a.date || a.createdAt
    }));

    res.json({ success: true, applicants });
  } catch (err) {
    console.error("❌ Error loading applicants:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================
// GET drive by ID
// ============================
router.get('/:id', async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, error: 'Drive not found' });
    res.json({ success: true, drive });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// CREATE a drive
// ============================
router.post('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const newDrive = await Drive.create(req.body);
    res.status(201).json({ success: true, drive: newDrive });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// UPDATE drive
// ============================
router.put('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const updated = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, error: "Drive not found" });

    res.json({ success: true, drive: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================
// DELETE drive
// ============================
router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const deleted = await Drive.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, error: "Drive not found" });

    res.json({ success: true, drive: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
