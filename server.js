const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const moveRoute = require('./src/routes/move');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet());

// Rate limiting on API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please wait' }
});
app.use('/api/', apiLimiter);

// Body parsing with size limit
app.use(express.json({ limit: '1kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/move', moveRoute);

// Global error handler - never leak internal details
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
