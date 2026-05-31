const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const LearningGap = require('../models/LearningGap');
const Class = require('../models/Class');
const { analyzeLearningGaps } = require('../utils/aiService');

// @desc    Create a new quiz (Teacher only)
exports.createQuiz = async (req, res) => {
  const { title, description, classId, questions, duration, dueDate } = req.body;

  try {
    const quiz = await Quiz.create({
      title,
      description,
      class: classId,
      teacher: req.user._id,
      questions,
      duration,
      dueDate
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for a class
exports.getQuizzesByClass = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ class: req.params.classId }).select('-questions');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz details (with questions)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz and trigger AI analysis
exports.submitQuiz = async (req, res) => {
  const { answers, timeTaken } = req.body; // answers: array of selected option indices

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const topicStats = {};

    quiz.questions.forEach((q, index) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0 };
      }
      topicStats[q.topic].total += 1;

      if (answers[index] === q.correctOption) {
        score += 1;
        topicStats[q.topic].correct += 1;
      }
    });

    const topicPerformance = Object.keys(topicStats).map(topic => ({
      topic,
      correct: topicStats[topic].correct,
      total: topicStats[topic].total,
      accuracy: (topicStats[topic].correct / topicStats[topic].total) * 100
    }));

    const result = await Result.create({
      student: req.user._id,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      topicPerformance,
      timeTaken
    });

    // Trigger AI Analysis asynchronously
    const performanceData = {
      score,
      totalQuestions: quiz.questions.length,
      topicPerformance,
      timeTaken
    };

    const gaps = await analyzeLearningGaps(performanceData);
    if (gaps) {
      await LearningGap.create({
        student: req.user._id,
        quiz: quiz._id,
        ...gaps
      });
    }

    res.status(201).json({ result, gaps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
