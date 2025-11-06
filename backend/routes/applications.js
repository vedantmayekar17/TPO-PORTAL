const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { authenticateToken, adminOnly } = require('../middlewares/auth');

router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.json({ success: true, message: 'Submitted!' });
  } catch (e) {
    res.json({ success: false, message: 'Submission error' });
  }
});

router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    // If admin or student viewing own applications
    if (req.user.role !== 'admin' && req.user.id !== req.params.studentId)
      return res.status(403).json({ success: false });
    const applications = await Application.find({ studentId: req.params.studentId });
    res.json({ success: true, applications });
  } catch (e) {
    res.json({ success: false, applications: [] });
  }
});

router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find();
    res.json({ success: true, applications });
  } catch (e) {
    res.json({ success: false, applications: [] });
  }
});

router.put('/update/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status, remarks, interviewDate } = req.body;
    const updated = await Application.findByIdAndUpdate(req.params.id, { status, remarks, interviewDate }, { new: true });
    res.json({ success: !!updated, application: updated });
  } catch (e) {
    res.json({ success: false });
  }
});

module.exports = router;
