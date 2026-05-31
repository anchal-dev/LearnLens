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

// @desc    Get teacher dashboard summary stats (live MongoDB aggregation)
// @route   GET /api/teacher/dashboard
exports.getTeacherDashboard = async (req, res) => {
  try {
    // 1. Get all classes for this teacher
    const classes = await Class.find({ teacher: req.user._id });

    // 2. Collect unique student IDs across all classes
    const studentIdSet = new Set();
    classes.forEach(cls => cls.students.forEach(id => studentIdSet.add(id.toString())));
    const studentIds = [...studentIdSet];

    const totalStudents = studentIds.length;

    // 3. Compute average score across all student results
    let averageScore = 0;
    if (studentIds.length > 0) {
      const results = await Result.find({ student: { $in: studentIds } });
      if (results.length > 0) {
        const totalAcc = results.reduce((acc, r) => {
          const pct = r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0;
          return acc + pct;
        }, 0);
        averageScore = parseFloat((totalAcc / results.length).toFixed(1));
      }
    }

    // 4. Count active learning gap alerts (distinct gaps for all students)
    const learningGapAlerts = await LearningGap.countDocuments({
      student: { $in: studentIds }
    });

    // 5. Compute at-risk students
    //    A student is "at risk" if:
    //    - Their average score < 60% (low performer), OR
    //    - They have at least one High risk LearningGap
    let atRiskStudentIds = new Set();

    if (studentIds.length > 0) {
      // Check students with high risk gaps
      const highRiskGaps = await LearningGap.find({
        student: { $in: studentIds },
        riskLevel: 'High'
      }).select('student');
      highRiskGaps.forEach(g => atRiskStudentIds.add(g.student.toString()));

      // Check students with low average scores
      for (const sid of studentIds) {
        const studentResults = await Result.find({ student: sid });
        if (studentResults.length > 0) {
          const avg = studentResults.reduce((acc, r) =>
            acc + (r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0), 0
          ) / studentResults.length;
          if (avg < 60) {
            atRiskStudentIds.add(sid);
          }
        }
      }
    }

    const atRiskStudents = atRiskStudentIds.size;

    res.json({
      totalStudents,
      averageScore,
      learningGapAlerts,
      atRiskStudents
    });
  } catch (error) {
    console.error('getTeacherDashboard error:', error);
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
