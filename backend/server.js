const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB connection (no need for deprecated options after driver v4.0+)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error: ', err));

// API routes
app.use('/api/students', require('./routes/students'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/companyDrives', require('./routes/companyDrives'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/certificates', require('./routes/certificates'));
// add after existing mounts
app.use('/api/drives', require('./routes/companyDrives')); // alias for companyDrives
app.use('/api/adminLogin', require('./routes/admins')); // alias for admins routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Catch-all for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Frontend fallback for direct browser navigation (optional)
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
