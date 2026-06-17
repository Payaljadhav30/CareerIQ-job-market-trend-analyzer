const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  fieldOfInterest: { type: String },
  hoursPerWeek: { type: Number, required: true },
  completedWeeks: [{ type: Number }],  // ← saves progress
  weeks: [{
    weekNumber: Number,
    title: String,
    topics: [String],
    resources: [String],
    goals: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
