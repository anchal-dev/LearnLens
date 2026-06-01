const express = require('express');
const {
  getTeacherClasses,
  getClassById,
  createClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
  getTeacherDashboard,
  getClassAnalytics,
  getTeacherDashboardClass,
  getLearningGaps,
  getRiskStudents,
  getPerformanceTrend
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

// Production Dashboard Endpoints
router.get('/dashboard/:classId', protect, authorize('teacher'), getTeacherDashboardClass);
router.get('/learning-gaps/:classId', protect, authorize('teacher'), getLearningGaps);
router.get('/risk-students/:classId', protect, authorize('teacher'), getRiskStudents);
router.get('/performance-trend/:classId', protect, authorize('teacher'), getPerformanceTrend);

module.exports = router;
