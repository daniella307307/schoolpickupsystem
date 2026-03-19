const express = require('express');
const {registerUser, loginUser} = require('../controllers/userController');

const router = express.Router();

// User registration
router.post('/auth/register', registerUser);
// User login
router.post('/auth/login', loginUser);
module.exports = router;