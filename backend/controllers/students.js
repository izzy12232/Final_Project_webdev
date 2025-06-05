// Import the Student model and validation utilities
const Student = require('../models/Student');
const { validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');

// Controller: Get all students with pagination
exports.getAllStudents = async (req, res) => {
  try {
    // Parse pagination query parameters (default: page 1, limit 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Retrieve students with count, applying pagination and sorting
    const { count, rows } = await Student.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']] // Order by creation date (newest first)
    });

    // Respond with paginated results
    res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      students: rows
    });
  } catch (error) {
    // Handle errors (e.g., database issues)
    res.status(500).json({ error: error.message });
  }
};

// Controller: Create a new student
exports.createStudent = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return validation errors
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create student record in the database
    const student = await Student.create(req.body);
    res.status(201).json(student); // Respond with created student
  } catch (error) {
    // Handle creation errors (e.g., validation issues)
    res.status(400).json({ error: error.message });
  }
};

// Controller: Get a student by ID
exports.getStudentById = async (req, res) => {
  try {
    // Find student by primary key (ID from URL parameter)
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      // Return 404 if not found
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student); // Respond with student data
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller: Update student by ID
exports.updateStudent = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find student to update
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Apply updates
    await student.update(req.body);
    res.json(student); // Respond with updated student
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controller: Delete a student by ID
exports.deleteStudent = async (req, res) => {
  try {
    // Find student to delete
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete student record
    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller: Search students by full name or student ID (partial matches)
exports.searchStudents = async (req, res) => {
  try {
    const { query } = req.query; // Get search query from query parameters

    // Find students where fullName or studentId contains the query string
    const students = await Student.findAll({
      where: {
        [Sequelize.Op.or]: [
          { fullName: { [Sequelize.Op.like]: `%${query}%` } },
          { studentId: { [Sequelize.Op.like]: `%${query}%` } }
        ]
      }
    });

    res.json(students); // Return matching students
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller: Filter students by course and/or year level
exports.filterStudents = async (req, res) => {
  try {
    const { course, yearLevel } = req.query;

    // Build filter conditions based on query params
    const where = {};
    if (course) where.course = course;
    if (yearLevel) where.yearLevel = yearLevel;

    // Query students with the applied filters
    const students = await Student.findAll({ where });
    res.json(students); // Return filtered students
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
