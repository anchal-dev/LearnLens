const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // Index 0-3
  explanation: { type: String, default: '' },
  topic: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, required: true },
  topic:       { type: String, required: true },
  description: { type: String, default: '' },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  questions:   [questionSchema],
  duration:    { type: Number, default: 30 }, // minutes
  dueDate:     { type: Date },
  isAIGenerated: { type: Boolean, default: false },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
