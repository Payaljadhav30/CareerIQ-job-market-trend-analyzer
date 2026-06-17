const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String },
  fileUrl: { type: String },
  rawText: { type: String },
  targetRole: { type: String },
  fieldOfInterest: { type: String },
  analysis: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    skillMatchPercentage: Number,
    extractedSkills: [String],
    missingSkills: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
