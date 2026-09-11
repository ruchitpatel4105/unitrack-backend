const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', authenticate, requireRole('admin'), routeController.createRoute);
router.put('/:id', authenticate, requireRole('admin'), routeController.updateRoute);
router.delete('/:id', authenticate, requireRole('admin'), routeController.deleteRoute);

module.exports = router;
