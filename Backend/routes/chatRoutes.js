const express = require('express');
const { chatWithTutor, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, chatWithTutor);
router.get('/history', protect, getChatHistory);

module.exports = router;
