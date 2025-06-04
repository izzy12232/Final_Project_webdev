// Add these at the TOP of your app.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db');
const studentRoutes = require('./routes/students');

const app = express();

// Configuration
const dataDir = path.resolve(__dirname, './data'); // Using ./data instead of ../data

// 1. First check data directory permissions
try {
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }
  
  // Check permissions
  fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
  console.log('Data directory has read/write permissions');
} catch (err) {
  console.error('Data directory error:', err);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Routes
app.use('/api/students', studentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database initialization
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    
    // Use alter: true in development, empty object in production
    const syncOptions = process.env.NODE_ENV === 'development' ? { alter: true } : {};
    return sequelize.sync(syncOptions);
  })
  .then(() => {
    console.log('Database tables synchronized');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database location: ${path.resolve(dataDir, 'student-records.db')}`);
    });
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });

module.exports = app;