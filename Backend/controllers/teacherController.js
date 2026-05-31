const User = require('../models/User');
const Class = require('../models/Class');
const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');

// @desc    Get teacher's classes
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).populate('students', 'name email');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class performance and risk analytics
exports.getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;
    const currentClass = await Class.findById(classId).populate('students', 'name avatar');
    
    if (!currentClass) return res.status(404).json({ message: 'Class not found' });

    // Performance per student
    const studentPerformance = await Promise.all(currentClass.students.map(async (student) => {
      const results = await Result.find({ student: student._id });
      const gaps = await LearningGap.find({ student: student._id });
      
      const avgScore = results.length > 0 
        ? results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length 
        : 0;

      // Risk Prediction System
      // Risk Score = Low Activity + Declining Scores + High Risk Gaps
      let riskLevel = 'Low';
      const highRiskGaps = gaps.filter(g => g.riskLevel === 'High').length;
      
      if (highRiskGaps > 1 || (results.length > 0 && avgScore < 0.5)) {
        riskLevel = 'High';
      } else if (highRiskGaps > 0 || (results.length > 0 && avgScore < 0.7)) {
        riskLevel = 'Medium';
      }

      return {
        _id: student._id,
        name: student.name,
        avatar: student.avatar,
        avgScore: (avgScore * 100).toFixed(2),
        quizzesTaken: results.length,
        riskLevel,
        recentGaps: gaps.slice(0, 2)
      };
    }));

    res.json({
      className: currentClass.name,
      students: studentPerformance,
      totalStudents: currentClass.students.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a class
exports.createClass = async (req, res) => {
  const { name, description } = req.body;
  try {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass = await Class.create({
      name,
      description,
      teacher: req.user._id,
      inviteCode
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
