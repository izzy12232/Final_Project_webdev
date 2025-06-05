// Required modules at the very top
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db'); // Sequelize instance configured for SQLite
const studentRoutes = require('./routes/students');

const app = express();

// Configuration: Set the path to the data directory relative to this file
const dataDir = path.resolve(__dirname, './data'); // Using ./data within project root

// 1. Check data directory existence and permissions before starting server
try {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }

  // Check if the app has read/write permissions on the data directory
  fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('Data directory has read/write permissions');
} catch (err) {
  // If permission check or creation fails, log error and exit process
  console.error('Data directory error:', err);
  process.exit(1);
}

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing for frontend-backend communication
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static frontend files from ../frontend/public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Register API routes for students under '/api/students'
app.use('/api/students', studentRoutes);

// Error handling middleware (for any unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log full error stack for debugging
  res.status(500).json({ error: 'Something went wrong!' }); // Generic error response
});

// Initialize database connection and sync models
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');

    // Use alter:true in development to sync schema without dropping tables
    const syncOptions = process.env.NODE_ENV === 'development' ? { alter: true } : {};

    // Synchronize models with database
    return sequelize.sync(syncOptions);
  })
  .then(() => {
    console.log('Database tables synchronized');

    // Start the server after successful DB sync
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database location: ${path.resolve(dataDir, 'student-records.db')}`);
    });
  })
  .catch(err => {
    // Handle DB connection or sync errors, log and exit
    console.error('Database initialization failed:', err);
    process.exit(1);
  });

module.exports = app; // Export app for testing or external usage
