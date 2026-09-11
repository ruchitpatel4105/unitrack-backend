const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticate, requireRole('admin'), studentController.getAllStudents);
router.post('/', authenticate, requireRole('admin'), studentController.addStudent);
router.put('/:id', authenticate, requireRole('admin'), studentController.updateStudent);
router.post('/:id/reset-password', authenticate, requireRole('admin'), studentController.resetStudentPassword);
router.delete('/:id', authenticate, requireRole('admin'), studentController.deleteStudent);

module.exports = router;
