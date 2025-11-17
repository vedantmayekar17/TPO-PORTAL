const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

/* -------------------------------
   ✅ Environment Check
-------------------------------- */
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

/* -------------------------------
   ✅ Middleware setup
-------------------------------- */
app.use(morgan('dev'));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------
   ✅ Static files
-------------------------------- */
app.use('/uploads', express.static('uploads'));

/* -------------------------------
   ✅ MongoDB Connection
-------------------------------- */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

/* -------------------------------
   ✅ Import Routes
-------------------------------- */
const applicationsRoute = require('./routes/applications');
const studentsRoute = require('./routes/students');
const adminsRoute = require('./routes/admins');
const drivesRoute = require('./routes/drives');
const feedbacksRoute = require('./routes/feedbacks');
const notificationsRoute = require('./routes/notifications');
const certificateRoutes = require("./routes/certificates");

/* -------------------------------
   ✅ Mount Routes
-------------------------------- */
app.use('/api/applications', applicationsRoute);
app.use('/api/students', studentsRoute);
app.use('/api/admins', adminsRoute);
app.use('/api/drives', drivesRoute);
app.use('/api/feedbacks', feedbacksRoute);
app.use('/api/notifications', notificationsRoute);

app.use("/api/certificates", certificateRoutes);   // ✅ MOVE HERE

/* -------------------------------
   ✅ Health Check (MUST BE BEFORE 404)
-------------------------------- */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running smoothly 🚀', timestamp: new Date() });
});

/* -------------------------------
   ❌ 404 Handlers — MUST BE LAST
-------------------------------- */
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});
app.use((req, res) => res.status(404).send('Page not found'));

/* -------------------------------
   ✅ Global Error Handlers
-------------------------------- */
process.on('uncaughtException', (err) => console.error('❌ Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('❌ Unhandled Rejection:', reason));

/* -------------------------------
   ✅ Graceful Shutdown
-------------------------------- */
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed');
  process.exit(0);
});

/* -------------------------------
   ✅ Start Server
-------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));




module.exports = app;
