const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Class 10', 'Class 11 Science', 'Class 11 Commerce', 'Class 12 Science', 'Class 12 Commerce']
  },
  section: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    default: 'A'
  },
  stream: {
    type: String,
    enum: ['General', 'Science', 'Commerce'],
    default: 'General'
  },
  description: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
