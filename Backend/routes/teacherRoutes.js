const express = require('express');
const {
  getTeacherClasses,
  getClassById,
  createClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getTeacherDashboard,
  getClassAnalytics
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Dashboard summary
router.get('/dashboard', protect, authorize('teacher'), getTeacherDashboard);

// Class CRUD
router.get('/classes', protect, authorize('teacher'), getTeacherClasses);
router.post('/classes', protect, authorize('teacher'), createClass);
router.get('/classes/:classId', protect, authorize('teacher'), getClassById);
router.delete('/classes/:classId', protect, authorize('teacher'), deleteClass);

// Student management
router.post('/classes/:classId/students', protect, authorize('teacher'), addStudentToClass);
router.delete('/classes/:classId/students/:studentId', protect, authorize('teacher'), removeStudentFromClass);

// Analytics
router.get('/analytics/:classId', protect, authorize('teacher'), getClassAnalytics);

module.exports = router;
