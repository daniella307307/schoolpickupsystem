const express = require('express');
const { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,getStudentsByParentId, createStudents, deleteStudents, deleteStudentsByParentId } = require('../controllers/studentsController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const router = express.Router();

// Create a new student
router.post('/', verifyToken, authorizeRole('admin'), createStudent);
// Get all students
router.get('/', verifyToken, getAllStudents);
// Get a student by ID
router.get('/:id', verifyToken, getStudentById);
// Update a student
router.put('/:id', verifyToken, authorizeRole('admin'), updateStudent);
// Delete a student
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteStudent);
//get students by parent ID
router.get('/parent/:parentId', verifyToken, getStudentsByParentId);
//Bulk create students
router.post('/bulk', verifyToken, authorizeRole('admin'), createStudents);
//Delete students by parent ID
router.delete('/parent/:parentId', verifyToken, authorizeRole('admin'), deleteStudentsByParentId);
//Delete students by IDs
router.delete('/', verifyToken, authorizeRole('admin'), deleteStudents);
module.exports = router;