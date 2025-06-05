const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const studentController = require('../controllers/students');
const validateHandler = require('../middleware/validateHandler');

// =====================
// Validation Rules
// =====================

// Validation rules for creating/updating a student
const studentValidation = [
  body('studentId')
    .notEmpty()
    .trim()
    .withMessage('Student ID is required'),
  body('fullName')
    .notEmpty()
    .trim()
    .withMessage('Full name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('age')
    .isInt({ min: 16, max: 100 })
    .withMessage('Age must be between 16 and 100'),
  body('course')
    .notEmpty()
    .trim()
    .withMessage('Course is required'),
  body('yearLevel')
    .isInt({ min: 1, max: 5 })
    .withMessage('Year level must be between 1 and 5')
];

// Validation for `id` parameter in routes
const idParamValidation = [
  param('id')
    .isInt()
    .withMessage('ID must be an integer')
];

// =====================
// Student Routes
// =====================

// GET /students - Fetch paginated list of students
router.get('/',
  validateHandler(studentController.getAllStudents)
);

// POST /students - Create a new student
router.post('/',
  studentValidation,
  validateHandler(studentController.createStudent)
);

// GET /students/search?query=... - Search students by name or ID
router.get('/search',
  validateHandler(studentController.searchStudents)
);

// GET /students/filter?course=...&yearLevel=... - Filter students by course/year level
router.get('/filter',
  validateHandler(studentController.filterStudents)
);

// GET /students/:id - Get a single student by ID
router.get('/:id',
  idParamValidation,
  validateHandler(studentController.getStudentById)
);

// PUT /students/:id - Update a student by ID
router.put('/:id',
  idParamValidation,
  studentValidation,
  validateHandler(studentController.updateStudent)
);

// DELETE /students/:id - Delete a student by ID
router.delete('/:id',
  idParamValidation,
  validateHandler(studentController.deleteStudent)
);

// Export the router to be used in app.js
module.exports = router;
