const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, requireRole('driver'), emergencyController.createAlert);
router.get('/', authenticate, emergencyController.getAlerts);
router.put('/:id/status', authenticate, requireRole('admin'), emergencyController.updateAlertStatus);

module.exports = router;
