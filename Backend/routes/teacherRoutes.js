const express = require('express');
const { getTeacherClasses, getClassAnalytics, createClass, getTeacherDashboard } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard);
router.get('/classes', protect, authorize('teacher'), getTeacherClasses);
router.get('/analytics/:classId', protect, authorize('teacher'), getClassAnalytics);
router.post('/classes', protect, authorize('teacher'), createClass);

module.exports = router;
