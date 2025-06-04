const cron = require('node-cron');
const { performBackup } = require('./backup');

// Run daily at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled backup...');
  performBackup().catch(console.error);
});

console.log('Backup scheduler started');