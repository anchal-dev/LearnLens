const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  topicPerformance: [{
    topic: { type: String },
    correct: { type: Number },
    total: { type: Number },
    accuracy: { type: Number }
  }],
  timeTaken: { type: Number }, // in seconds
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', resultSchema);
