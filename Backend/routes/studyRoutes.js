const express = require('express');
const { getClassMaterials, getSubjectDetails, updateProgress } = require('../controllers/studyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/class-materials', protect, authorize('student'), getClassMaterials);
router.get('/subject/:subjectId', protect, authorize('student'), getSubjectDetails);
router.post('/progress', protect, authorize('student'), updateProgress);

module.exports = router;