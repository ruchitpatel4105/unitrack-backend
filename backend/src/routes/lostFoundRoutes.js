const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', lostFoundController.getItems);
router.get('/claims', authenticate, lostFoundController.getClaims);
router.get('/:id', lostFoundController.getItemById);
router.post('/', authenticate, upload.single('image'), lostFoundController.createItem);
router.post('/claim', authenticate, upload.single('proof_image'), lostFoundController.createClaim);
router.put('/claims/:id/status', authenticate, requireRole('admin'), lostFoundController.updateClaimStatus);

module.exports = router;
