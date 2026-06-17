const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  fieldOfInterest: { type: String, default: '' },
  skills: [{ type: String }],
  savedJobs: [{
    title: String, company: String, location: String,
    salary: String, link: String, source: String, savedAt: { type: Date, default: Date.now }
  }],
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  darkMode: { type: Boolean, default: false },
  notifications: [{
    message: String, postId: String, read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  profileComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
