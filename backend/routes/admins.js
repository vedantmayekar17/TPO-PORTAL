const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const { authenticateToken, adminOnly } = require("../middlewares/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const csv = require("csvtojson");
const fs = require("fs");

/* =====================================================
   ✅ ADMIN SIGNUP
===================================================== */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      username,
      email,
      password: hashed,
      role: "admin",
    });
    res.json({ success: true, message: "Admin created successfully", admin });
  } catch (err) {
    console.error("Admin signup error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ✅ ADMIN LOGIN (email or username)
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email/Username and password required" });

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!admin)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email/username or password" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email/username or password" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ✅ GET ALL ADMINS (ADMIN ONLY)
===================================================== */
router.get("/", authenticateToken, adminOnly, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json({ success: true, admins });
  } catch (err) {
    console.error("Admin GET error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ✅ DELETE ADMIN (ADMIN ONLY)
===================================================== */
router.delete("/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const deleted = await Admin.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Admin delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ✅ RESET PASSWORD (ADMIN ONLY)
===================================================== */
router.post("/reset-password/:id", authenticateToken, adminOnly, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: "Missing new password" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const updated = await Admin.findByIdAndUpdate(
      req.params.id,
      { password: hashed },
      { new: true }
    ).select("-password");
    if (!updated) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, message: "Password reset successfully", admin: updated });
  } catch (err) {
    console.error("Admin reset password error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   ✅ BULK UPLOAD STUDENT SHEET (CSV/XLSX)
===================================================== */
router.post(
  "/upload-students",
  authenticateToken,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("📁 File received:", req.file);

      // 1️⃣ Ensure file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded. Send file in form-data with key 'file'.",
        });
      }

      const filePath = req.file.path;

      // 2️⃣ Convert CSV → JSON
      const studentsArr = await csv().fromFile(filePath);

      // 3️⃣ Add students
      let count = 0;
      for (const student of studentsArr) {
        if (!student.name || !student.email || !student.roll || !student.password) continue;

        const hashed = await bcrypt.hash(student.password, 10);
        await Student.create({
          name: student.name,
          email: student.email,
          roll: student.roll,
          password: hashed,
          phone: student.phone || "",
          branch: student.branch || "",
          year: student.year || "",
          cgpa: student.cgpa || "",
          skills: student.skills || "",
          bio: student.bio || "",
          documents: {
            resume: "",
            marksheet: "",
            photo: "",
            certificates: [],
            offerLetters: [],
            idProof: "",
          },
        });
        count++;
      }

      // 4️⃣ Delete the uploaded file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `✅ ${count} students imported successfully!`,
      });
    } catch (err) {
      console.error("❌ Bulk upload error:", err);
      res
        .status(500)
        .json({ success: false, message: "Bulk upload error: " + err.message });
    }
  }
);

module.exports = router;
