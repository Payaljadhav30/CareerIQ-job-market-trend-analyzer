const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  details: { type: String },
  questions: [{
    question: String,
    userAnswer: String,
    feedback: String,
    score: Number
  }],
  totalScore: { type: Number, default: 0 },
  overallFeedback: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
