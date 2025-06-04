const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Sequelize } = require('sequelize');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const gzip = promisify(zlib.gzip);

// Configuration
const config = {
  sourceDb: path.join(__dirname, '../data/student-records.db'), // Match your active DB
  backupDir: path.join(__dirname, '../data/backups'),
  maxBackups: 30, // Keep last 30 backups
  compressBackups: true
};

// Ensure backup directory exists
if (!fs.existsSync(config.backupDir)) {
  fs.mkdirSync(config.backupDir, { recursive: true });
}

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}${config.compressBackups ? '.gz' : '.db'}`;
  const backupPath = path.join(config.backupDir, backupName);

  try {
    console.log(`Starting backup to ${backupPath}`);

    // Read the database file
    const data = await readFile(config.sourceDb);

    // Compress if enabled
    const backupData = config.compressBackups ? await gzip(data) : data;

    // Write backup file
    await writeFile(backupPath, backupData);
    console.log(`Backup successful: ${backupPath}`);

    // Verify backup
    await verifyBackup(backupPath, config.compressBackups);
    
    // Clean up old backups
    await cleanupOldBackups();

    return backupPath;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

async function verifyBackup(backupPath, isCompressed) {
  try {
    const backupData = await readFile(backupPath);
    const data = isCompressed ? zlib.gunzipSync(backupData) : backupData;
    
    // Quick verification by checking file header
    if (!data.slice(0, 16).toString('hex').startsWith('53514c69746520666f726d61742033')) {
      throw new Error('Backup verification failed - invalid SQLite header');
    }
    
    console.log('Backup verified successfully');
    return true;
  } catch (error) {
    console.error('Backup verification failed:', error);
    // Delete the invalid backup
    fs.unlinkSync(backupPath);
    throw error;
  }
}

async function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('backup-'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(config.backupDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

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

// Execute backup if run directly
if (require.main === module) {
  performBackup().catch(() => process.exit(1));
}

module.exports = {
  performBackup,
  cleanupOldBackups,
  verifyBackup
};