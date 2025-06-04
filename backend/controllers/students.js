const Student = require('../models/Student');
const { validationResult } = require('express-validator');
const { Sequelize } = require('sequelize');

exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      students: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    const students = await Student.findAll({
      where: {
        [Sequelize.Op.or]: [
          { fullName: { [Sequelize.Op.like]: `%${query}%` } },
          { studentId: { [Sequelize.Op.like]: `%${query}%` } }
        ]
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.filterStudents = async (req, res) => {
  try {
    const { course, yearLevel } = req.query;
    const where = {};
    
    if (course) where.course = course;
    if (yearLevel) where.yearLevel = yearLevel;

    const students = await Student.findAll({ where });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};