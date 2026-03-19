const User = require('../models/User');
const Student = require('../models/Student');
const logger = require('../configs/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
require('dotenv').config();

// Create a new user
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, phone } = req.body;
        const newUser = await User.create({ username, email, password, role, phone });
        logger.info(`User created: ${newUser.username}`);
        res.status(201).json(newUser);
    }                       
    catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        res.status(500).json({ error: 'Failed to create user' });
    }           
};

//GET all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        logger.info(`Fetched all users`);
        res.status(200).json(users);
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

//GET user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            logger.warn(`User not found: ID ${req.params.id}`);
            return res.status(404).json({ error: 'User not found' });
        }
        logger.info(`Fetched user: ${user.username}`);
        res.status(200).json(user);
    } catch (error) {
        logger.error(`Error fetching user: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Update user details
const updateUser = async (req, res) => {
    try {
        const { username, email, password, role, phone } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) {
            logger.warn(`User not found for update: ID ${req.params.id}`);
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update({ username, email, password, role, phone });
        logger.info(`User updated: ${user.username}`);
        res.status(200).json(user);
    }
    catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {   
        const user = await User.findByPk(req.params.id);
        if (!user) {
            logger.warn(`User not found for deletion: ID ${req.params.id}`);
            return res.status(404).json({ error: 'User not found' });
        }
        await user.destroy();
        logger.info(`User deleted: ${user.username}`);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

//Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user || user.password !== password) {
            logger.warn(`Invalid login attempt: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        logger.info(`User logged in: ${user.username}`);
        res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
        logger.error(`Error during login: ${error.message}`);
        res.status(500).json({ error: 'Failed to login' });
    }
};

//Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, password,role = 'parent' } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            logger.warn(`User already exists: ${email}`);
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10); // Implement hashing in production
        const newUser = await User.create({ username, email, password: hashedPassword, role, phone });
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        await sendEmai(
            email,
            'Welcome to Bright Angels',
            `Hello ${username},\n\nThank you for registering at Bright Angels. We're excited to have you on board!\n\nBest regards,\nBright Angels Team`
            `This is system is supposed to help u notify us about when u want to pick up ur kid so that everything is ready when u get here. We also have a feature that allows u to notify us if ur kid is sick and won't be coming to school. We hope this system will make things easier for u and help us provide better care for ur kid.`
        ).catch(error => {
            logger.error(`Error sending welcome email: ${error.message}`);
        });
        logger.info(`User registered: ${newUser.username}`);
        res.status(201).json({ user: newUser, token });
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    registerUser
};