const User = require('../models/User');
const Class = require('../models/Class');
const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

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

// ─── GET /api/teacher/dashboard/:classId ──────────────────────────────
exports.getTeacherDashboardClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    const totalStudents = classDoc.students.length;
    const studentIds = classDoc.students;

    const quizzes = await Quiz.find({ class: classId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    // 1. Average Class Score
    let averageScore = 0;
    if (quizIds.length > 0) {
      const avgResult = await Result.aggregate([
        { $match: { quiz: { $in: quizIds } } },
        { $group: {
            _id: null,
            avgScore: { $avg: { $multiply: [ { $divide: [ "$score", "$totalQuestions" ] }, 100 ] } }
          }
        }
      ]);
      if (avgResult.length > 0) {
        averageScore = parseFloat(avgResult[0].avgScore.toFixed(1));
      }
    }

    // 2. Learning Gap Alerts
    let learningGapAlerts = 0;
    if (quizIds.length > 0) {
      const topicGaps = await Result.aggregate([
        { $match: { quiz: { $in: quizIds } } },
        { $unwind: "$topicPerformance" },
        { $group: {
            _id: "$topicPerformance.topic",
            totalCorrect: { $sum: "$topicPerformance.correct" },
            totalQuestions: { $sum: "$topicPerformance.total" }
          }
        },
        { $project: {
            topic: "$_id",
            avgAccuracy: {
              $cond: [
                { $eq: ["$totalQuestions", 0] },
                0,
                { $multiply: [ { $divide: ["$totalCorrect", "$totalQuestions"] }, 100 ] }
              ]
            }
          }
        },
        { $match: { avgAccuracy: { $lt: 50 } } }
      ]);
      learningGapAlerts = topicGaps.length;
    }

    // 3. At-Risk Students
    let atRiskStudents = 0;
    if (studentIds.length > 0 && quizIds.length > 0) {
      const riskAggregate = await Class.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(classId) } },
        { $unwind: "$students" },
        { $lookup: {
            from: "results",
            let: { studentId: "$students" },
            pipeline: [
              { $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$student", "$$studentId"] },
                      { $in: ["$quiz", quizIds] }
                    ]
                  }
                }
              }
            ],
            as: "results"
          }
        },
        { $lookup: {
            from: "learninggaps",
            let: { studentId: "$students" },
            pipeline: [
              { $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$student", "$$studentId"] },
                      { $in: ["$quiz", quizIds] }
                    ]
                  }
                }
              }
            ],
            as: "gaps"
          }
        },
        { $project: {
            student: "$students",
            avgAccuracy: {
              $cond: [
                { $eq: [{ $size: "$results" }, 0] },
                100,
                { $multiply: [ { $avg: {
                    $map: {
                      input: "$results",
                      as: "r",
                      in: { $divide: ["$$r.score", "$$r.totalQuestions"] }
                    }
                  } }, 100 ] }
              ]
            },
            highRiskGapsCount: {
              $size: {
                $filter: {
                  input: "$gaps",
                  as: "gap",
                  cond: { $eq: ["$$gap.riskLevel", "High"] }
                }
              }
            }
          }
        },
        { $project: {
            student: 1,
            riskLevel: {
              $cond: [
                { $or: [ { $gt: ["$highRiskGapsCount", 1] }, { $lt: ["$avgAccuracy", 50] } ] },
                "High",
                { $cond: [
                    { $or: [ { $gt: ["$highRiskGapsCount", 0] }, { $lt: ["$avgAccuracy", 70] } ] },
                    "Medium",
                    "Low"
                  ]
                }
              ]
            }
          }
        },
        { $match: { riskLevel: { $in: ["High", "Medium"] } } }
      ]);
      atRiskStudents = riskAggregate.length;
    }

    res.json({
      totalStudents,
      averageScore,
      learningGapAlerts,
      atRiskStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/learning-gaps/:classId ─────────────────────────
exports.getLearningGaps = async (req, res) => {
  try {
    const { classId } = req.params;
    const quizzes = await Quiz.find({ class: classId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    if (quizIds.length === 0) {
      return res.json([]);
    }

    const strugglingTopics = await Result.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $unwind: "$topicPerformance" },
      { $group: {
          _id: "$topicPerformance.topic",
          totalCorrect: { $sum: "$topicPerformance.correct" },
          totalQuestions: { $sum: "$topicPerformance.total" },
          strugglingStudentsCount: {
            $sum: {
              $cond: [ { $lt: ["$topicPerformance.accuracy", 0.6] }, 1, 0 ]
            }
          }
        }
      },
      { $project: {
          topic: "$_id",
          count: "$strugglingStudentsCount",
          avgAccuracy: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $multiply: [ { $divide: ["$totalCorrect", "$totalQuestions"] }, 100 ] }
            ]
          }
        }
      },
      { $match: { avgAccuracy: { $lt: 50 } } },
      { $project: {
          topic: 1,
          count: 1,
          severity: {
            $cond: [ { $lt: ["$avgAccuracy", 40] }, "High", "Medium" ]
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(strugglingTopics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/risk-students/:classId ─────────────────────────
exports.getRiskStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    const quizzes = await Quiz.find({ class: classId }).select('_id');
    const quizIds = quizzes.map(q => q._id);

    if (classDoc.students.length === 0 || quizIds.length === 0) {
      return res.json([]);
    }

    const studentsRisk = await Class.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(classId) } },
      { $unwind: "$students" },
      { $lookup: {
          from: "users",
          localField: "students",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      { $lookup: {
          from: "results",
          let: { studentId: "$students" },
          pipeline: [
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $in: ["$quiz", quizIds] }
                  ]
                }
              }
            }
          ],
          as: "results"
        }
      },
      { $lookup: {
          from: "learninggaps",
          let: { studentId: "$students" },
          pipeline: [
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $in: ["$quiz", quizIds] }
                  ]
                }
              }
            }
          ],
          as: "gaps"
        }
      },
      { $project: {
          name: "$studentInfo.name",
          avatar: "$studentInfo.avatar",
          avgAccuracy: {
            $cond: [
              { $eq: [{ $size: "$results" }, 0] },
              100,
              { $multiply: [ { $avg: {
                  $map: {
                    input: "$results",
                    as: "r",
                    in: { $divide: ["$$r.score", "$$r.totalQuestions"] }
                  }
                } }, 100 ] }
            ]
          },
          highRiskGapsCount: {
            $size: {
              $filter: {
                input: "$gaps",
                as: "gap",
                cond: { $eq: ["$$gap.riskLevel", "High"] }
              }
            }
          },
          weakTopics: {
            $reduce: {
              input: "$gaps.weakTopics",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          },
          recommendedActions: {
            $reduce: {
              input: "$gaps.recommendedActions",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },
      { $project: {
          name: 1,
          avatar: 1,
          avgAccuracy: 1,
          highRiskGapsCount: 1,
          weakTopics: 1,
          recommendedActions: 1,
          riskLevel: {
            $cond: [
              { $or: [ { $gt: ["$highRiskGapsCount", 1] }, { $lt: ["$avgAccuracy", 50] } ] },
              "High",
              { $cond: [
                  { $or: [ { $gt: ["$highRiskGapsCount", 0] }, { $lt: ["$avgAccuracy", 70] } ] },
                  "Medium",
                  "Low"
                ]
              }
            ]
          }
        }
      },
      { $match: { riskLevel: { $in: ["High", "Medium"] } } }
    ]);

    const formattedRiskStudents = studentsRisk.map(s => {
      const uniqueTopics = [...new Set(s.weakTopics)];
      const uniqueActions = [...new Set(s.recommendedActions)];
      
      const gapStr = uniqueTopics.join(' & ') || 'Core Concepts';
      const reason = s.avgAccuracy < 60 
        ? `Average score of ${s.avgAccuracy.toFixed(1)}% across class diagnostics.` 
        : `Frequent learning gap alerts in ${uniqueTopics.slice(0, 2).join(', ') || 'subject areas'}.`;
      
      const suggestion = uniqueActions.length > 0 
        ? uniqueActions.slice(0, 2).join(' ') 
        : 'Assign review questions and monitor progress in subsequent quizzes.';

      return {
        name: s.name,
        riskLevel: s.riskLevel,
        avatar: s.avatar || s.name[0],
        reason,
        gap: gapStr,
        suggestion
      };
    });

    res.json(formattedRiskStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/teacher/performance-trend/:classId ─────────────────────
exports.getPerformanceTrend = async (req, res) => {
  try {
    const { classId } = req.params;
    const quizzes = await Quiz.find({ class: classId }).sort({ createdAt: 1 });
    const quizIds = quizzes.map(q => q._id);

    if (quizIds.length === 0) {
      return res.json({
        trendScores: [70, 70, 70, 70, 70, 70],
        trendLabels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4', 'Quiz 5', 'Quiz 6'],
        topics: [],
        gapScores: []
      });
    }

    // 1. Line Chart Trend: average score per quiz
    const trendAggregate = await Result.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $group: {
          _id: "$quiz",
          avgScore: { $avg: { $divide: ["$score", "$totalQuestions"] } },
          completedAt: { $min: "$completedAt" }
        }
      },
      { $sort: { completedAt: 1 } },
      { $project: {
          avgAccuracy: { $multiply: ["$avgScore", 100] }
        }
      }
    ]);

    const trendScores = trendAggregate.map(t => Math.round(t.avgAccuracy));
    const trendLabels = trendAggregate.map((t, idx) => `Quiz ${idx + 1}`);

    while (trendScores.length < 6) {
      const base = trendScores.length > 0 ? trendScores[trendScores.length - 1] : 70;
      trendScores.push(base);
      trendLabels.push(`Quiz ${trendScores.length}`);
    }

    // 2. Bar Chart Topic Breakdown: average accuracy per topic
    const topicBreakdown = await Result.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $unwind: "$topicPerformance" },
      { $group: {
          _id: "$topicPerformance.topic",
          totalCorrect: { $sum: "$topicPerformance.correct" },
          totalQuestions: { $sum: "$topicPerformance.total" }
        }
      },
      { $project: {
          topic: "$_id",
          accuracy: {
            $cond: [
              { $eq: ["$totalQuestions", 0] },
              0,
              { $multiply: [ { $divide: ["$totalCorrect", "$totalQuestions"] }, 100 ] }
            ]
          }
        }
      },
      { $sort: { accuracy: 1 } },
      { $limit: 5 }
    ]);

    const topics = topicBreakdown.map(tb => tb.topic);
    const gapScores = topicBreakdown.map(tb => Math.round(tb.accuracy));

    res.json({
      trendScores,
      trendLabels,
      topics,
      gapScores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

