const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Sequelize } = require('sequelize'); // Note: Sequelize imported but not used here, safe to remove if unused
const { promisify } = require('util');

// Promisify callback-based functions for async/await usage
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const gzip = promisify(zlib.gzip);

// Configuration settings for backup
const config = {
  sourceDb: path.join(__dirname, '../data/student-records.db'), // Path to the active SQLite DB file
  backupDir: path.join(__dirname, '../data/backups'),          // Directory to store backups
  maxBackups: 30,                                              // Max number of backups to keep before deleting oldest
  compressBackups: true                                        // Whether to gzip-compress backups
};

// Ensure the backup directory exists, create if it does not
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

/**
 * Main function to perform backup of the database file
 */
async function performBackup() {
  // Create a timestamped backup file name, with extension based on compression setting
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}${config.compressBackups ? '.gz' : '.db'}`;
  const backupPath = path.join(config.backupDir, backupName);

  try {
    console.log(`Starting backup to ${backupPath}`);

    // Read the database file into memory
    const data = await readFile(config.sourceDb);

    // Compress the data if enabled
    const backupData = config.compressBackups ? await gzip(data) : data;

    // Write the backup file to the backup directory
    await writeFile(backupPath, backupData);
    console.log(`Backup successful: ${backupPath}`);

    // Verify integrity of the backup
    await verifyBackup(backupPath, config.compressBackups);
    
    // Remove old backups beyond maxBackups limit
    await cleanupOldBackups();

    return backupPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

/**
 * Verifies the backup by checking the SQLite file header
 * @param {string} backupPath - Path to the backup file
 * @param {boolean} isCompressed - Whether the backup file is compressed
 */
async function verifyBackup(backupPath, isCompressed) {
  try {
    // Read backup file data
    const backupData = await readFile(backupPath);

    // Decompress if necessary
    const data = isCompressed ? zlib.gunzipSync(backupData) : backupData;
    
    // Check the SQLite file header signature (first 16 bytes)
    // '53514c69746520666f726d61742033' is hex for "SQLite format 3"
    if (!data.slice(0, 16).toString('hex').startsWith('53514c69746520666f726d61742033')) {
      throw new Error('Backup verification failed - invalid SQLite header');
    }
    
    console.log('Backup verified successfully');
    return true;
  } catch (error) {
    console.error('Backup verification failed:', error);
    // Delete invalid backup file to avoid confusion
    fs.unlinkSync(backupPath);
    throw error;
  }
}

/**
 * Removes old backup files to keep backup directory clean
 */
async function cleanupOldBackups() {
  try {
    // List all files starting with 'backup-'
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(config.backupDir, file)).mtime.getTime()
      }))
      // Sort files by modification time descending (newest first)
      .sort((a, b) => b.time - a.time);

    // If more backups than max allowed, delete the oldest ones
    if (files.length > config.maxBackups) {
      const oldFiles = files.slice(config.maxBackups);
      for (const file of oldFiles) {
        fs.unlinkSync(path.join(config.backupDir, file.name));
        console.log(`Deleted old backup: ${file.name}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
  }
}

// If this script is run directly (node backup.js), perform a backup immediately
if (require.main === module) {
  performBackup().catch(() => process.exit(1));
}

// Export functions for potential use elsewhere (e.g., in a scheduler)
module.exports = {
  performBackup,
  cleanupOldBackups,
  verifyBackup
};
