const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

// Absolute path to data directory
const dataDir = path.resolve(__dirname, '../data');
const dbPath = path.join(dataDir, 'student-records.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath, // Absolute path
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Database connected at ${dbPath}`);
    // Check if database file exists
    if (fs.existsSync(dbPath)) {
      console.log('Database file exists');
    } else {
      console.log('Database file will be created on first write');
    }
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

module.exports = sequelize;