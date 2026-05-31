const express = require('express');
const { createQuiz, getQuizzesByClass, getQuizById, submitQuiz } = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('teacher'), createQuiz);
router.get('/class/:classId', protect, getQuizzesByClass);
router.get('/:id', protect, getQuizById);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
