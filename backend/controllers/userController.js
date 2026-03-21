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
        const db_password = user ? user.password : null;
        const isMatch = await bcrypt.compare(password,db_password);
        if (!user || !isMatch) {
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

const getParents = async (req, res) => {
    try {
        const parents = await User.findAll({ where: { role: 'parent' } });
        logger.info(`Fetched parents: ${parents.length}`);
        res.status(200).json(parents);
    } catch (error) {
        logger.error(`Error fetching parents: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch parents' });
    }
};


//Register user
const registerUser = async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            phone
        });

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await sendEmail(
            email,
            'Welcome to Bright Angels',
            `Hello ${username},

Thank you for registering at Bright Angels. We're excited to have you on board!

This system helps you notify us when picking up your child and reporting absences.

Best regards,
Bright Angels Team`
        );

        res.status(201).json({ user: newUser, token });

    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

const sendWelcomeEmail = async (email, username) => {
    try {
        await sendEmail(
            email,
            'Welcome to Bright Angels',
            `Hello ${username},
Thank you for registering at Bright Angels. We're excited to have you on board!
This system helps you notify us when picking up your child and reporting absences.
Best regards,
Bright Angels Team`
        );
        logger.info(`Welcome email sent to: ${email}`);
    }
    catch (error) {
        logger.error(`Error sending welcome email: ${error.message}`);
    }
};

const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        // Always respond the same (security)
        if (!user) {
            logger.warn(`Password reset requested for non-existent email: ${email}`);
            return res.status(200).json({
                message: "If this email exists, a reset link has been sent."
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await sendEmail(
            email,
            'Password Reset Request',
            `Click the link below to reset your password:\n\n${resetLink}`
        );

        logger.info(`Password reset email sent to: ${email}`);

        return res.status(200).json({
            message: "If this email exists, a reset link has been sent."
        });

    } catch (error) {
        logger.error(`Error sending password reset email: ${error.message}`);
        return res.status(500).json({
            message: "Something went wrong. Please try again."
        });
    }
};

const updatePassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        logger.info(`Password updated for user: ${user.username}`);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error(`Error updating password: ${error.message}`);
        res.status(500).json({ error: 'Failed to update password' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.isVerified = true;
        await user.save();
        logger.info(`Email verified for user: ${user.username}`);
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        logger.error(`Error verifying email: ${error.message}`);
        res.status(500).json({ error: 'Failed to verify email' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    registerUser,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    verifyEmail,
    updatePassword,
    getParents
};