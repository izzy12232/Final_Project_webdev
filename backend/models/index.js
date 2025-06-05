const sequelize = require('../config/db'); // Import Sequelize instance from config

// List of model definers to be initialized
const modelDefiners = [
  require('./User'),
  // Add other model files here, e.g. require('./Student')
];

// Register all models to Sequelize
modelDefiners.forEach(definer => definer(sequelize));

// Define and set up model associations (if any)
const setupAssociations = () => {
  const { User } = sequelize.models;
  // Define associations between models here (e.g., User.hasMany(Post))
  console.log('Database associations established');
};

// Function to initialize the database connection and synchronize models
const initializeDatabase = async () => {
  try {
    // Attempt to connect to the database
    await sequelize.authenticate();
    console.log('Database connection established');

    // Set up associations between models
    setupAssociations();

    // In development, synchronize models with the database schema (non-destructive)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true }); // Alters tables to match models
      console.log('Database models synchronized');
    }

    return sequelize; // Return Sequelize instance
  } catch (error) {
    // Log and exit on failure to connect
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Export sequelize instance, models, and initializer
module.exports = {
  sequelize,                 // The Sequelize instance
  ...sequelize.models,       // Spread all registered models for easy import
  initializeDatabase         // Function to initialize database
};
