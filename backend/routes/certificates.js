const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/certificates');

// 🔥 Auto-create upload folder (important)
const uploadDir = path.join(__dirname, '..', 'uploads', 'certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created folder:", uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// =====================
// POST: upload certificate
// =====================
router.post('/', upload.single('certificate'), async (req, res) => {
  try {
    const { studentId, type, title, issuer, date } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ success: false, error: 'No file uploaded' });

    const newCert = await Certificate.create({
      studentId,
      type,
      title,
      issuer,
      date: date ? new Date(date) : null,
      fileName: file.filename,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    });

    res.status(201).json({ success: true, certificate: newCert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
