// Import required modules
const path = require('path'); // Built-in Node.js module for handling file paths
const fs = require('fs'); // File system module for interacting with the file system
const { Sequelize } = require('sequelize'); // Import Sequelize ORM

// Resolve absolute path to the 'data' directory, relative to the current file's directory
const dataDir = path.resolve(__dirname, '../data');

// Construct the full path to the SQLite database file
const dbPath = path.join(dataDir, 'student-records.db');

// Check if the 'data' directory exists; if not, create it
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true }); // Create directory, including parent folders if needed
  console.log(`Created data directory: ${dataDir}`);
}

// Initialize Sequelize with SQLite dialect and custom configuration
const sequelize = new Sequelize({
  dialect: 'sqlite', // Use SQLite as the database
  storage: dbPath,   // Path to the database file
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in development mode
  pool: {
    max: 5, // Maximum number of connection in pool
    min: 0, // Minimum number of connections
    acquire: 30000, // Max time (ms) Sequelize will try to get a connection before throwing error
    idle: 10000 // Time (ms) a connection can be idle before being released
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Database connected at ${dbPath}`);

    // Confirm if the database file exists on disk
    if (fs.existsSync(dbPath)) {
      console.log('Database file exists');
    } else {
      console.log('Database file will be created on first write');
    }
  })
  .catch(err => {
    // Log any errors during connection and exit the process
    console.error('❌ Database connection error:', err);
    process.exit(1); // Exit with failure code
  });

// Export the Sequelize instance for use in other parts of the app
module.exports = sequelize;
