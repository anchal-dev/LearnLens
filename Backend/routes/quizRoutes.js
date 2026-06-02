const express = require('express');
const {
  createQuiz,
  getTeacherQuizzes,
  getQuizzesByClass,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  generateAIQuiz,
  submitQuiz
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Teacher quiz management
router.get('/teacher/mine',    protect, authorize('teacher'), getTeacherQuizzes);
router.post('/generate-ai',    protect, authorize('teacher'), generateAIQuiz);
router.post('/',               protect, authorize('teacher'), createQuiz);
router.put('/:id',             protect, authorize('teacher'), updateQuiz);
router.delete('/:id',          protect, authorize('teacher'), deleteQuiz);

// Shared (teacher + student)
router.get('/class/:classId',  protect, getQuizzesByClass);
router.get('/:id',             protect, getQuizById);

// Student submit
router.post('/:id/submit',     protect, authorize('student'), submitQuiz);

module.exports = router;
