const express = require('express');
const {registerUser, loginUser,verifyEmail, updatePassword, updateUser,sendPasswordResetEmail, deleteUser, getAllUsers,getUserById } = require('../controllers/userController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// User registration
router.post('/auth/register', registerUser);
// User login
router.post('/auth/login', loginUser);
//update passw
router.post('/auth/update-password', updatePassword);
//verify email
router.get('/auth/verify-email', verifyEmail);
//update user
router.put('/:id',verifyToken, updateUser);
// Password reset
router.post('/auth/send-password-reset-email', sendPasswordResetEmail);
//delete user
router.delete('/:id',verifyToken,authorizeRole("admin"),deleteUser);
// Get all users
router.get('/users',verifyToken,authorizeRole("admin"), getAllUsers);
// Get user by ID
router.get('/:id',verifyToken, getUserById);
module.exports = router;