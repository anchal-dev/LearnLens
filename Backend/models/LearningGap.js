const mongoose = require('mongoose');

const learningGapSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  weakTopics: [{ type: String }],
  weakConcepts: [{ type: String }],
  confidenceScore: { type: Number }, // 0-100
  aiFeedback: { type: String },
  recommendedActions: [{ type: String }],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LearningGap', learningGapSchema);
