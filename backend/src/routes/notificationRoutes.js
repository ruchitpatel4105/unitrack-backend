const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticate, notificationController.getUserNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.post('/broadcast', authenticate, requireRole('admin'), notificationController.broadcastNotification);

module.exports = router;
