const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
  score: { type: Number, default: 0 },
  lastViewed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);