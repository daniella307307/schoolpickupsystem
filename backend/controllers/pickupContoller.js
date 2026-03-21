const Pickup = require('../models/Pickup');
const Student = require('../models/Student');
const logger = require('../configs/logger');
const PickupLg = require('../models/PickUpLogs');
const Notification = require('../models/Notifications');
const createPickup = async (req, res) => {
    try {
        const { student_id, pickup_time, message } = req.body;
        
        // 1. Check required fields
        if (!student_id || !pickup_time) {
            return res.status(400).json({
                error: "student_id and pickup_time are required"
            });
        }
        //chekck if pickup_time is a valid date
        if (isNaN(Date.parse(pickup_time))) {
            return res.status(400).json({
                error: "Invalid pickup_time format. Must be a valid date string."
            });
        }
        //check student id is not an array of student ids
        if (Array.isArray(student_id)) {
            const students = await Student.findAll({
                where: { id: student_id }
            });
            if (students.length !== student_id.length) {
                return res.status(404).json({
                    error: "One or more students not found"
                });
            }
            // Check if all students belong to the logged-in parent
            for (const student of students) {
                if (student.parent_id !== req.user.id) {
                    return res.status(403).json({
                        error: `You are not allowed to create pickup for student ID ${student.id}`
                    });
                }
            }
            // Create pickups for all students
            const pickups = []; 
            for (const student of students) {
                const pickup = await Pickup.create({
                    student_id: student.id,
                    pickup_time,
                    parent_id: req.user.id,
                    message,
                    status: "pending"
                });
                pickups.push(pickup);
                await PickupLg.create({
                    action: "created",
                    pickup_request_id: pickup.id,
                    performed_by: req.user.id
                });
            }
            logger.info(`Pickups created for student IDs: ${student_id.join(', ')}`);
            return res.status(201).json(pickups);
        }

        // 2. Check if student exists
        const student = await Student.findByPk(student_id);

        if (!student) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        // 3. Ensure student belongs to logged-in parent
        if (student.parent_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to create pickup for this student"
            });
        }

        // 4. Create pickup
        const pickup = await Pickup.create({
            student_id,
            pickup_time,
            parent_id: req.user.id, // 🔥 IMPORTANT
            message,
            status: "pending"
        });

        // 5. (Optional) Log the pickup
        await PickupLg.create({
            pickup_request_id: pickup.id,
            action: "created",
            performed_by: req.user.id
        });

        logger.info(`Pickup created for student ID: ${student_id}`);

        res.status(201).json(pickup);

    } catch (error) {
        logger.error(`Error creating pickup: ${error.message}`);
        res.status(500).json({ error: 'Failed to create pickup' });
    }
};

const updatePickupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pickup = await Pickup.findByPk(id);

        if (!pickup) {
            return res.status(404).json({ error: "Pickup not found" });
        }

        if (pickup.status !== 'pending') {
            return res.status(400).json({
                error: `Pickup already ${pickup.status}`
            });
        }

        pickup.status = status;
        await pickup.save();

        // 🔥 SEND NOTIFICATION TO PARENT
        if (status === 'approved') {
            await Notification.create({
                user_id: pickup.parent_id,
                message: "Your pickup request has been approved ✅"
            });
        }

        res.json({ message: `Pickup ${status}`, pickup });

    } catch (error) {
        res.status(500).json({ error: "Failed to update pickup" });
    }
};

const getPendingPickups = async (req, res) => {
    try {
        const pickups = await Pickup.findAll({
            where: { status: 'pending' }
        });

        res.json(pickups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pickups' });
    }
};

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
module.exports = {
    createPickup,
    updatePickupStatus,
    getPendingPickups,
    getNotifications
};