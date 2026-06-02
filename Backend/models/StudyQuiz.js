const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
  explanation: { type: String },
  topic: { type: String }
});

const studyQuizSchema = new mongoose.Schema({
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  title: { type: String, required: true },
  description: { type: String },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('StudyQuiz', studyQuizSchema);