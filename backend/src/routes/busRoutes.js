const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', busController.getAllBuses);
router.get('/:id', busController.getBusById);
router.post('/', authenticate, requireRole('admin'), busController.createBus);
router.put('/:id', authenticate, requireRole('admin'), busController.updateBus);
router.delete('/:id', authenticate, requireRole('admin'), busController.deleteBus);

module.exports = router;
