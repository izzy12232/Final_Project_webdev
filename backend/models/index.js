const sequelize = require('../config/db'); // Now this is a Sequelize instance

const modelDefiners = [
  require('./User'),
  // Add other models as needed
];

modelDefiners.forEach(definer => definer(sequelize));

const setupAssociations = () => {
  const { User } = sequelize.models;
  // Define associations here if needed
  console.log('Database associations established');
};

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    setupAssociations();

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
    }

    return sequelize;
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  ...sequelize.models,
  initializeDatabase
};
