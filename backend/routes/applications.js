const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Application = require('../models/Application');
const Student = require('../models/Student');
const Drive = require('../models/drives');
const { authenticateToken, adminOnly } = require('../middlewares/auth');

// ============================
// GET APPLICATIONS (STUDENT/ADMIN)
// ============================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.query;
    let query = {};

    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        query.studentId = studentId;
      } else {
        query.studentId = studentId.toString();
      }
    }

    const apps = await Application.find(query)
      .populate('driveId', 'company role')
      .sort({ createdAt: -1 });

    const normalized = apps.map(a => ({
      _id: a._id,
      studentId: a.studentId,
      driveId: a.driveId?._id,
      company: a.company || a.driveId?.company,
      role: a.role || a.driveId?.role,
      status: a.status,
      appliedOn: a.date || a.createdAt
    }));

    return res.json({ success: true, applications: normalized });

  } catch (err) {
    console.error("❌ Error fetching applications:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================
// ADD APPLICATION (Student + Admin)
// ============================
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { driveId, studentId: bodyStudentId, appliedDate, appliedByAdmin } = req.body;

    // If admin applied -> take studentId from body
    // If student applied -> take from token
    const studentId = req.user.role === "admin"
      ? bodyStudentId
      : (mongoose.Types.ObjectId.isValid(req.user?._id) ? req.user._id : req.user?.id);

    if (!studentId || !driveId) {
      return res.status(400).json({ success: false, error: 'Missing studentId or driveId' });
    }

    const student = await Student.findById(studentId);
    const drive = await Drive.findById(driveId);

    if (!student || !drive) {
      return res.status(404).json({ success: false, error: 'Student or Drive not found' });
    }

    const existing = await Application.findOne({ studentId, driveId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already applied for this drive' });
    }

    const application = new Application({
      studentId,
      driveId,
      name: student.name,
      roll: student.roll,
      company: drive.company,
      role: drive.role,
      status: 'Pending',
      date: appliedDate || new Date(),
      appliedByAdmin: appliedByAdmin || false
    });

    await application.save();
    res.status(201).json({ success: true, application });

  } catch (err) {
    console.error('❌ Error saving application:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ============================
// UPDATE STATUS (ADMIN)
// ============================
router.put('/:id/status', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, application: updated });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// ============================
// APPROVE APPLICATION (ADMIN)
// ============================
router.put('/:id/approve', authenticateToken, adminOnly, async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Approved" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: "Application not found" });
    res.json({ success: true, application: updated });
  } catch (err) {
    console.error("❌ Approve error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================
// REJECT APPLICATION (ADMIN)
// ============================
router.put('/:id/reject', authenticateToken, adminOnly, async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, error: "Application not found" });
    res.json({ success: true, application: updated });
  } catch (err) {
    console.error("❌ Reject error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ============================
// DELETE APPLICATION (ADMIN)
// ============================
router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
