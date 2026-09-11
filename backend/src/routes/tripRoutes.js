const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/active', tripController.getActiveTrips);
router.get('/driver/current', authenticate, requireRole('driver'), tripController.getDriverCurrentTrip);
router.post('/start', authenticate, requireRole('driver'), tripController.startTrip);
router.post('/end', authenticate, requireRole('driver'), tripController.endTrip);
router.post('/location', authenticate, requireRole('driver'), tripController.recordLocation);

module.exports = router;
