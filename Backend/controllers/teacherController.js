const User = require('../models/User');
const Class = require('../models/Class');
const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');

// ─── Helper ───────────────────────────────────────────────────────────
const genInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const streamFromName = (name) => {
  if (name.includes('Science')) return 'Science';
  if (name.includes('Commerce')) return 'Commerce';
  return 'General';
};

// ─── GET /api/teacher/classes ─────────────────────────────────────────
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/classes/:classId ───────────────────────────────
exports.getClassById = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, teacher: req.user._id })
      .populate('students', 'name email avatar joinedAt');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/teacher/classes ────────────────────────────────────────
exports.createClass = async (req, res) => {
  const { name, section, description } = req.body;

  if (!name || !section) {
    return res.status(400).json({ message: 'Class name and section are required' });
  }

  const VALID_NAMES = [
    'Class 10', 'Class 11 Science', 'Class 11 Commerce',
    'Class 12 Science', 'Class 12 Commerce'
  ];
  if (!VALID_NAMES.includes(name)) {
    return res.status(400).json({ message: `Invalid class name. Choose from: ${VALID_NAMES.join(', ')}` });
  }

  try {
    // Prevent duplicate class+section per teacher
    const exists = await Class.findOne({ name, section: section.toUpperCase(), teacher: req.user._id });
    if (exists) {
      return res.status(400).json({ message: `${name} – Section ${section.toUpperCase()} already exists for your account` });
    }

    const newClass = await Class.create({
      name,
      section: section.toUpperCase(),
      stream: streamFromName(name),
      description: description || '',
      teacher: req.user._id,
      inviteCode: genInviteCode()
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/teacher/classes/:classId ────────────────────────────
exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.classId, teacher: req.user._id });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/teacher/classes/:classId/students ──────────────────────
// Body: { email }  — teacher adds a student by their email address
exports.addStudentToClass = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Student email is required' });

  try {
    const cls = await Class.findOne({ _id: req.params.classId, teacher: req.user._id });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const student = await User.findOne({ email: email.trim().toLowerCase(), role: 'student' });
    if (!student) return res.status(404).json({ message: 'No student account found with that email' });

    if (cls.students.includes(student._id)) {
      return res.status(400).json({ message: `${student.name} is already in this class` });
    }

    cls.students.push(student._id);
    await cls.save();

    // Return the class with populated students
    await cls.populate('students', 'name email avatar joinedAt');
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/teacher/classes/:classId/students/:studentId ─────────
exports.removeStudentFromClass = async (req, res) => {
  try {
    const cls = await Class.findOne({ _id: req.params.classId, teacher: req.user._id });
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    const studentExists = cls.students.some(id => id.toString() === req.params.studentId);
    if (!studentExists) return res.status(404).json({ message: 'Student not found in this class' });

    cls.students = cls.students.filter(id => id.toString() !== req.params.studentId);
    await cls.save();

    await cls.populate('students', 'name email avatar joinedAt');
    res.json(cls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/dashboard ──────────────────────────────────────
exports.getTeacherDashboard = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id });

    const studentIdSet = new Set();
    classes.forEach(cls => cls.students.forEach(id => studentIdSet.add(id.toString())));
    const studentIds = [...studentIdSet];
    const totalStudents = studentIds.length;

    let averageScore = 0;
    if (studentIds.length > 0) {
      const results = await Result.find({ student: { $in: studentIds } });
      if (results.length > 0) {
        const totalAcc = results.reduce((acc, r) => {
          return acc + (r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0);
        }, 0);
        averageScore = parseFloat((totalAcc / results.length).toFixed(1));
      }
    }

    const learningGapAlerts = await LearningGap.countDocuments({ student: { $in: studentIds } });

    let atRiskSet = new Set();
    if (studentIds.length > 0) {
      const highRiskGaps = await LearningGap.find({ student: { $in: studentIds }, riskLevel: 'High' }).select('student');
      highRiskGaps.forEach(g => atRiskSet.add(g.student.toString()));

      for (const sid of studentIds) {
        const sResults = await Result.find({ student: sid });
        if (sResults.length > 0) {
          const avg = sResults.reduce((acc, r) =>
            acc + (r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0), 0
          ) / sResults.length;
          if (avg < 60) atRiskSet.add(sid);
        }
      }
    }

    res.json({ totalStudents, averageScore, learningGapAlerts, atRiskStudents: atRiskSet.size });
  } catch (error) {
    console.error('getTeacherDashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/analytics/:classId ─────────────────────────────
exports.getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;
    const currentClass = await Class.findById(classId).populate('students', 'name avatar');
    if (!currentClass) return res.status(404).json({ message: 'Class not found' });

    const studentPerformance = await Promise.all(currentClass.students.map(async (student) => {
      const results = await Result.find({ student: student._id });
      const gaps = await LearningGap.find({ student: student._id });

      const avgScore = results.length > 0
        ? results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length
        : 0;

      let riskLevel = 'Low';
      const highRiskGaps = gaps.filter(g => g.riskLevel === 'High').length;
      if (highRiskGaps > 1 || (results.length > 0 && avgScore < 0.5)) riskLevel = 'High';
      else if (highRiskGaps > 0 || (results.length > 0 && avgScore < 0.7)) riskLevel = 'Medium';

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

    res.json({ className: currentClass.name, students: studentPerformance, totalStudents: currentClass.students.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
