const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken, adminOnly } = require("../middlewares/auth");

/* =====================================================
   ✅ SEND NOTIFICATION (ADMIN ONLY)
===================================================== */
router.post("/", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { message, target, branch, year, specificStudents } = req.body;

    // Validate message
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Validate specificStudents array
    if (specificStudents && !Array.isArray(specificStudents)) {
      return res.status(400).json({ success: false, message: "specificStudents must be an array" });
    }

    const note = new Notification({
      message: message.trim(),
      target: target || "all",
      branch: branch || null,
      year: year || null,
      specificStudents: specificStudents || [],
      sentBy: req.user?.name || "Admin"
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: "Notification sent",
      note: {
        id: note._id,
        message: note.message,
        target: note.target,
        branch: note.branch,
        year: note.year,
        specificStudents: note.specificStudents,
        sentBy: note.sentBy,
        createdAt: note.createdAt
      }
    });
  } catch (err) {
    console.error("Notification Send Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ GET ALL NOTIFICATIONS (Admin & Students)
===================================================== */
router.get("/", async (req, res) => {
  try {
    let filter = {};

    // If user is authenticated, filter notifications relevant to them
    if (req.user) {
      filter.$or = [
        { target: "all" },
        { branch: req.user.branch },
        { year: req.user.year },
        { specificStudents: req.user.id }
      ];
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications: notifications || []
    });
  } catch (err) {
    console.error("Fetch Notifications Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   ✅ DELETE NOTIFICATION (Admin Only)
===================================================== */
router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const deletedNote = await Notification.findByIdAndDelete(req.params.id);

    if (!deletedNote) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
