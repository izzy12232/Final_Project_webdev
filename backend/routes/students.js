const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const studentController = require('../controllers/students');
const validateHandler = require('../middleware/validateHandler');

// Validation rules
const studentValidation = [
  body('studentId').notEmpty().trim().withMessage('Student ID is required'),
  body('fullName').notEmpty().trim().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('age').isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),
  body('course').notEmpty().trim().withMessage('Course is required'),
  body('yearLevel').isInt({ min: 1, max: 5 }).withMessage('Year level must be between 1 and 5')
];

const idParamValidation = [
  param('id').isInt().withMessage('ID must be an integer')
];

// Student routes
router.get('/', 
  validateHandler(studentController.getAllStudents)
);

router.post('/', 
  studentValidation,
  validateHandler(studentController.createStudent)
);

router.get('/search', 
  validateHandler(studentController.searchStudents)
);

router.get('/filter', 
  validateHandler(studentController.filterStudents)
);

router.get('/:id', 
  idParamValidation,
  validateHandler(studentController.getStudentById)
);

router.put('/:id', 
  idParamValidation,
  studentValidation,
  validateHandler(studentController.updateStudent)
);

router.delete('/:id', 
  idParamValidation,
  validateHandler(studentController.deleteStudent)
);

module.exports = router;