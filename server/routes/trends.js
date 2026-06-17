const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { fetchAdzunaJobs, getStaticSkills } = require('../services/adzunaService');

router.get('/skills', auth, (req, res) => {
  const { field } = req.query;
  const skills = getStaticSkills(field);
  res.json({ skills, field: field || 'All Fields' });
});

router.get('/jobs', async (req, res) => {
  try {
    const { field, what } = req.query;
    const jobs = await fetchAdzunaJobs(field, what);
    res.json({ jobs, totalCount: jobs.length, field: field || 'All Fields', source: 'Adzuna' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { field } = req.query;
    const skills = getStaticSkills(field);
    const jobs = await fetchAdzunaJobs(field);
    res.json({ skills, jobs, field: field || 'All Fields' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
