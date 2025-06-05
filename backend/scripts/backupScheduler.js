const cron = require('node-cron');
const { performBackup } = require('./backup');

// Schedule the backup to run daily at 2:00 AM server time
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled backup...');
  performBackup().catch(console.error);
});

console.log('Backup scheduler started');
