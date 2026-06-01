const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');
const Quiz = require('../models/Quiz');
const Class = require('../models/Class');

// @desc    Get student dashboard stats
exports.getStudentDashboard = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id }).populate('quiz', 'title topic');
    const gaps = await LearningGap.find({ student: req.user._id }).sort({ createdAt: -1 }).limit(5);

    const resultCount = results.length;
    const totalTimeSeconds = results.reduce((sum, result) => sum + (result.timeTaken || 0), 0);
    const timeStudied = totalTimeSeconds ? `${(totalTimeSeconds / 3600).toFixed(1)}h` : null;
    const avgAccuracy = resultCount > 0
      ? Math.round(results.reduce((sum, result) => sum + ((result.score / Math.max(result.totalQuestions, 1)) * 100), 0) / resultCount)
      : null;

    const riskScore = avgAccuracy != null ? Math.max(0, Math.min(100, 100 - avgAccuracy)) : null;
    const riskLabel = avgAccuracy == null ? null : avgAccuracy >= 80 ? 'Low' : avgAccuracy >= 60 ? 'Medium' : 'High';

    const streak = (() => {
      if (!resultCount) return 0;
      const days = [...new Set(results.map((result) => result.completedAt.toISOString().slice(0, 10)))].sort().reverse();
      let currentStreak = 0;
      let dayPointer = new Date();
      dayPointer.setHours(0, 0, 0, 0);
      const dayKeys = new Set(days);
      while (dayKeys.has(dayPointer.toISOString().slice(0, 10))) {
        currentStreak += 1;
        dayPointer.setDate(dayPointer.getDate() - 1);
      }
      return currentStreak;
    })();

    const weeklyStudy = (() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const week = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return {
          dateKey: d.toISOString().slice(0, 10),
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          hours: 0,
        };
      });
      const weekMap = Object.fromEntries(week.map((w) => [w.dateKey, w]));
      results.forEach((result) => {
        if (!result.completedAt) return;
        const completedDate = result.completedAt.toISOString().slice(0, 10);
        if (weekMap[completedDate]) {
          weekMap[completedDate].hours += (result.timeTaken || 0) / 3600;
        }
      });
      return week.map((item) => ({ day: item.day, hours: Number(item.hours.toFixed(1)) }));
    })();

    res.json({
      results,
      recentGaps: gaps,
      totalQuizzes: resultCount,
      streak,
      timeStudied,
      avgAccuracy,
      riskScore,
      riskLabel,
      weeklyStudy,
      learningPlan: [],
      aiSummary: null,
      achievements: [],
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
