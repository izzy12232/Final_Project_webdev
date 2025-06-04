const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Paths configuration
const oldDbPath = path.join(__dirname, '../student-records.db'); // Old location
const newDbPath = path.join(__dirname, '../data/student-records.db'); // New persistent location
const dataDir = path.join(__dirname, '../data');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log(`Created persistent data directory: ${dataDir}`);
}

// Migration logic
if (fs.existsSync(oldDbPath)) {
  try {
    fs.renameSync(oldDbPath, newDbPath);
    console.log(`Successfully migrated database to persistent location: ${newDbPath}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
} else if (fs.existsSync(newDbPath)) {
  console.log('Persistent database already exists at:', newDbPath);
} else {
  console.log('No existing database found - a new one will be created when the server starts');
}

console.log('Migration check complete');