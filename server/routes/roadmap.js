const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const Resume = require('../models/Resume');
const { generateRoadmap } = require('../services/groqService');

router.post('/generate', auth, async (req, res) => {
  try {
    const { targetRole, hoursPerWeek, fieldOfInterest } = req.body;
    if (!targetRole || !hoursPerWeek) return res.status(400).json({ message: 'Target role and hours per week required' });
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const missingSkills = resume?.analysis?.missingSkills || [];
    const roadmapData = await generateRoadmap(targetRole, fieldOfInterest, hoursPerWeek, missingSkills);
    const roadmap = await Roadmap.create({
      userId: req.user.id, targetRole, fieldOfInterest, hoursPerWeek,
      weeks: roadmapData.weeks, completedWeeks: []
    });
    res.json(roadmap);
  } catch (err) {
    console.error('Roadmap error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Save week progress
router.put('/:id/progress', auth, async (req, res) => {
  try {
    const { completedWeeks } = req.body;
    const roadmap = await Roadmap.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completedWeeks },
      { new: true }
    );
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json(roadmap);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/latest', auth, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!roadmap) return res.status(404).json({ message: 'No roadmap found' });
    res.json(roadmap);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
