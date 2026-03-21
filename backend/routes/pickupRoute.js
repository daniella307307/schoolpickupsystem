const express = require('express');
const { createPickup,  getPendingPickups,updatePickupStatus,getNotifications} = require('../controllers/pickupContoller');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware'); 
const router = express.Router();

// Create a new pickup
router.post('/', verifyToken, authorizeRole('parent'), createPickup);
// Get pending pickups for a parent
router.get('/pending', verifyToken, getPendingPickups);
// Update a pickup
router.put('/:id', verifyToken, authorizeRole('admin'), updatePickupStatus);
// Get notifications for a parent
router.get('/notifications', verifyToken, getNotifications);
module.exports = router;