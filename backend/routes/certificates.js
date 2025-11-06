const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/certificates';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { studentId, type, title, issuer, date } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const cert = new Certificate({ studentId, type, title, issuer, date, fileName: req.file.filename, filePath: req.file.path, fileSize: req.file.size, mimeType: req.file.mimetype });
    await cert.save();
    res.json({ success: true, certificate: cert });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.studentId)
      return res.status(403).json({ success: false });
    const certificates = await Certificate.find({ studentId: req.params.studentId });
    res.json({ success: true, certificates });
  } catch (e) {
    res.status(500).json({ success: false, certificates: [] });
  }
});

router.get('/view/:id', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false });
    const filePath = path.resolve(certificate.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false });
    res.sendFile(filePath);
  } catch (e) { res.status(500).json({ success: false }); }
});

router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false });
    const filePath = path.resolve(certificate.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false });
    res.download(filePath, certificate.fileName);
  } catch (e) { res.status(500).json({ success: false }); }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) return res.status(404).json({ success: false });
    if (req.user.role !== 'admin' && req.user.id !== certificate.studentId)
      return res.status(403).json({ success: false });
    const filePath = path.resolve(certificate.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Certificate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;
