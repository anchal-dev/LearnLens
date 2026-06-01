const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  formulas: [{ type: String }],
  importantQuestions: [{ type: String }],
  previousYearQuestions: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);