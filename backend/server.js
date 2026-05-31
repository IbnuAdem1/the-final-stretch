// Load environment variables from .env file FIRST — before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ─── Connect to MongoDB Atlas ─────────────────────────────────
connectDB();

// ─── Create Express app ───────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────

// Allow requests from the React frontend
// In production, set FRONTEND_URL env var to your deployed frontend origin
const allowedOrigins = [
  'http://localhost:5173',  // Vite default
  'http://localhost:5174',  // Vite fallback port
  'http://localhost:3000',  // CRA fallback
  'http://localhost:4173',  // Vite preview
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  credentials: true,
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/settings',    require('./routes/settings'));
app.use('/api/tasks',       require('./routes/tasks'));
app.use('/api/reflections', require('./routes/reflections'));
app.use('/api/mentor',      require('./routes/mentor'));
app.use('/api/salah',       require('./routes/salah'));
app.use('/api/quran',       require('./routes/quran'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/analytics',   require('./routes/analytics'));
app.use('/api/journal',     require('./routes/journal'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Ansar backend is running', timestamp: new Date() });
});

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
