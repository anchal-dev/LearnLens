const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  shortTitle: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);