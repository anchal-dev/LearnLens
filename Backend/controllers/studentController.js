const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');

// @desc    Get student dashboard stats
exports.getStudentDashboard = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id }).populate('quiz', 'title topic');
    const gaps = await LearningGap.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5);
    
    // Calculate streak (simplified)
    const resultCount = results.length;
    
    res.json({
      results,
      recentGaps: gaps,
      totalQuizzes: resultCount,
      streak: 5 // Mock streak
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all learning gaps for a student
exports.getStudentGaps = async (req, res) => {
  try {
    const gaps = await LearningGap.find({ student: req.user._id }).populate('quiz', 'title');
    res.json(gaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
