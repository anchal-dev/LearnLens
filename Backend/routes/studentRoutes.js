const express = require('express');
const { getStudentDashboard, getStudentGaps } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/gaps', protect, authorize('student'), getStudentGaps);

module.exports = router;
