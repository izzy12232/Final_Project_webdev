const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import Sequelize instance

// Define the Student model
const Student = sequelize.define('Student', {
  studentId: {
    type: DataTypes.STRING,     // Student ID as a string
    allowNull: false,           // Required field
    unique: true                // Must be unique across all records
  },
  fullName: {
    type: DataTypes.STRING,     // Full name of the student
    allowNull: false            // Required field
  },
  email: {
    type: DataTypes.STRING,     // Email address
    allowNull: false,           // Required field
    validate: {
      isEmail: true             // Must be a valid email format
    }
  },
  age: {
    type: DataTypes.INTEGER,    // Student's age
    allowNull: false,           // Required field
    validate: {
      min: 16,                  // Minimum age allowed is 16
      max: 100                  // Maximum age allowed is 100
    }
  },
  course: {
    type: DataTypes.STRING,     // Course name or code
    allowNull: false            // Required field
  },
  yearLevel: {
    type: DataTypes.INTEGER,    // Year level (e.g., 1st, 2nd)
    allowNull: false,           // Required field
    validate: {
      min: 1,                   // Minimum year level is 1
      max: 5                    // Maximum year level is 5
    }
  }
}, {
  tableName: 'students',         // Explicit table name in the database
  timestamps: true              // Adds createdAt and updatedAt timestamps
});

// Export the model so it can be used in controllers and routes
module.exports = Student;
