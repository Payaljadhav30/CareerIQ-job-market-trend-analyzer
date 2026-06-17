const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { suggestCourses } = require('../services/groqService');

// Get course suggestions
router.post('/suggest', auth, async (req, res) => {
  try {
    const { fieldOfInterest, targetRole } = req.body;

    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const missingSkills = resume?.analysis?.missingSkills || ['fundamental skills'];

    const data = await suggestCourses(fieldOfInterest, missingSkills, targetRole);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get courses based on latest resume
router.get('/my-courses', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ message: 'Please analyze your resume first' });

    const data = await suggestCourses(resume.fieldOfInterest, resume.analysis.missingSkills, resume.targetRole);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
