// routes/feedbacks.js
const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Application = require('../models/Application');
const Student = require('../models/Student');
const Drive = require('../models/drives');
const { authenticateToken, adminOnly } = require("../middlewares/auth");

/* =====================================================
   ✅ SUBMIT FEEDBACK (STUDENT)
===================================================== */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Feedback text is required" });
    }

    const newFeedback = new Feedback({
      studentId: req.user._id,       // from authenticateToken
      studentName: req.user.name,    // assuming name is in the token payload
      text,
    });

    await newFeedback.save();
    res.status(201).json({ success: true, message: "Feedback submitted", feedback: newFeedback });
  } catch (err) {
    console.error("Feedback submission error:", err);
    res.status(500).json({ success: false, message: "Server error while submitting feedback" });
  }
});

/* =====================================================
   ✅ GET ALL FEEDBACKS (ADMIN ONLY)
===================================================== */
router.get("/", authenticateToken, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("Fetch feedbacks error:", err);
    res.status(500).json({ success: false, message: "Server error fetching feedbacks" });
  }
});

/* =====================================================
   ✅ UPDATE FEEDBACK STATUS / REPLY (ADMIN ONLY)
===================================================== */
router.put("/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { status, reply } = req.body;
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, reply },
      { new: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Feedback updated", feedback: updatedFeedback });
  } catch (err) {
    console.error("Update feedback error:", err);
    res.status(500).json({ success: false, message: "Server error updating feedback" });
  }
});

module.exports = router;
