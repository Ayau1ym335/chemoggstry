const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const reactionsRoutes = require('./routes/reactions');
const runsRoutes = require('./routes/runs');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/reactions', reactionsRoutes);
app.use('/runs', runsRoutes);

// 404 Handler (unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error'
    }
  });
});

module.exports = app;
