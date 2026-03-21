const Student = require('../models/Student');
const User = require('../models/User');
const logger = require('../configs/logger');

const createStudent = async (req, res) => {
    try {
        const { name, class: studentClass, parent_id } = req.body;
        const parent = await User.findByPk(parent_id);
        if (!parent) {
            logger.warn(`Parent not found: ID ${parent_id}`);
            return res.status(404).json({ error: 'Parent not found' });
        }
        const newStudent = await Student.create({ name, class: studentClass, parent_id });
        logger.info(`Student created: ${newStudent.name}`);
        res.status(201).json(newStudent);
    } catch (error) {
        logger.error(`Error creating student: ${error.message}`);
        res.status(500).json({ error: 'Failed to create student' });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        logger.info(`Fetched all students`);
        res.status(200).json(students);
    } catch (error) {
        logger.error(`Error fetching students: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            logger.warn(`Student not found: ID ${req.params.id}`);
            return res.status(404).json({ error: 'Student not found' });
        }
        logger.info(`Fetched student: ${student.name}`);
        res.status(200).json(student);
    }
    catch (error) {
        logger.error(`Error fetching student: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};

const updateStudent = async (req, res) => {
    try {
        const { name, class: studentClass, parent_id } = req.body;
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            logger.warn(`Student not found for update: ID ${req.params.id}`);
            return res.status(404).json({ error: 'Student not found' });
        }
        await student.update({ name, class: studentClass, parent_id });
        logger.info(`Student updated: ${student.name}`);
        res.status(200).json(student);
    } catch (error) {
        logger.error(`Error updating student: ${error.message}`);
        res.status(500).json({ error: 'Failed to update student' });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            logger.warn(`Student not found for deletion: ID ${req.params.id}`);
            return res.status(404).json({ error: 'Student not found' });
        }   
        await student.destroy();
        logger.info(`Student deleted: ${student.name}`);
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting student: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete student' });
    }
};

const getStudentsByParentId = async (req, res) => {
    try {
        const parentId = req.params.parentId;
        const students = await Student.findAll({ where: { parent_id: parentId } });
        logger.info(`Fetched students for parent ID: ${parentId}`);
        res.status(200).json(students);
    } catch (error) {
        logger.error(`Error fetching students by parent ID: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};
const createStudents = async (req, res) => {
    try {
        const studentsData = req.body.students; // Expecting an array of student objects
        const createdStudents = await Student.bulkCreate(studentsData);
        logger.info(`Bulk created ${createdStudents.length} students`);
        res.status(201).json(createdStudents);
    } catch (error) {
        logger.error(`Error bulk creating students: ${error.message}`);
        res.status(500).json({ error: 'Failed to create students' });
    }
};

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent,getStudentsByParentId, createStudents };