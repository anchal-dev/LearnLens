const express = require('express');
const { registerUser, loginUser, getUserProfile, updateStudentClass } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/class', protect, updateStudentClass);

module.exports = router;
