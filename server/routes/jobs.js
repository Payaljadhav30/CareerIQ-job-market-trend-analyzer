const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { fetchAdzunaJobs, getFallbackJobs } = require('../services/adzunaService');

router.get('/search', auth, async (req, res) => {
  try {
    const { role, field } = req.query;
    const jobs = await fetchAdzunaJobs(field, role);
    res.json({ jobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my-jobs', auth, async (req, res) => {
  try {
    const { field } = req.query;
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user.id);
    const searchField = field || user?.fieldOfInterest || '';
    const jobs = await fetchAdzunaJobs(searchField);
    res.json({ jobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/internships', auth, async (req, res) => {
  try {
    const { field } = req.query;
    const user = await User.findById(req.user.id);
    const searchField = field || user?.fieldOfInterest || 'developer';
    const jobs = await fetchAdzunaJobs(searchField);
    const internships = [
      { title: `${searchField} Intern`, company: 'Various Startups', experience: 'Fresher', salary: '10-30k/month', location: 'Remote/Hybrid', link: `https://internshala.com/internships/${encodeURIComponent(searchField)}-internship`, source: 'Internshala', type: 'internship' },
      { title: 'Software Development Intern', company: 'Multiple Companies', experience: 'Fresher', salary: '15-25k/month', location: 'Bangalore/Pune/Hyderabad', link: 'https://internshala.com/internships/computer-science-internship', source: 'Internshala', type: 'internship' },
      ...jobs.slice(0, 4).map(j => ({ ...j, type: 'job' }))
    ];
    res.json({ jobs: internships });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Save a job to profile
router.post('/save', auth, async (req, res) => {
  try {
    const { title, company, location, salary, link, source } = req.body;
    const user = await User.findById(req.user.id);
    const alreadySaved = user.savedJobs.some(j => j.link === link);
    if (alreadySaved) return res.status(400).json({ message: 'Job already saved' });
    user.savedJobs.push({ title, company, location, salary, link, source });
    await user.save();
    res.json({ message: 'Job saved', savedJobs: user.savedJobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Remove saved job
router.delete('/save/:jobId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedJobs = user.savedJobs.filter(j => j._id.toString() !== req.params.jobId);
    await user.save();
    res.json({ message: 'Job removed', savedJobs: user.savedJobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get saved jobs
router.get('/saved', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedJobs');
    res.json({ jobs: user.savedJobs });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
