const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Paths configuration
const oldDbPath = path.join(__dirname, '../student-records.db'); // Old database file location
const newDbPath = path.join(__dirname, '../data/student-records.db'); // New persistent database location
const dataDir = path.join(__dirname, '../data'); // Directory for persistent data storage

// Create the data directory if it doesn't exist yet
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log(`Created persistent data directory: ${dataDir}`);
}

// Migration logic: move the existing DB file from old location to new location
if (fs.existsSync(oldDbPath)) {
  try {
    // Rename (move) the old database file to the new persistent location
    fs.renameSync(oldDbPath, newDbPath);
    console.log(`Successfully migrated database to persistent location: ${newDbPath}`);
  } catch (err) {
    // Log and exit if migration fails
    console.error('Migration failed:', err);
    process.exit(1);
  }
} else if (fs.existsSync(newDbPath)) {
  // If the DB already exists in the new location, just confirm it
  console.log('Persistent database already exists at:', newDbPath);
} else {
  // No database found in either location — it will be created fresh on startup
  console.log('No existing database found - a new one will be created when the server starts');
}

console.log('Migration check complete');
