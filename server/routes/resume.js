const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { analyzeResume } = require('../services/groqService');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(ext) && mimeAllowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF/DOC/DOCX files allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { targetRole, fieldOfInterest } = req.body;
    if (!targetRole || !fieldOfInterest) return res.status(400).json({ message: 'Target role and field of interest required' });

    let resumeText = '';
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      resumeText = data.text;
    } else {
      resumeText = fs.readFileSync(filePath, 'utf8');
    }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: 'Could not extract text. Ensure it is not a scanned image.' });
    }

    const analysis = await analyzeResume(resumeText, fieldOfInterest, targetRole);

    // Save as new entry (keep history)
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      rawText: resumeText.substring(0, 5000),
      targetRole,
      fieldOfInterest,
      analysis
    });

    if (analysis.extractedSkills?.length > 0) {
      await User.findByIdAndUpdate(req.user.id, { skills: analysis.extractedSkills });
    }

    res.json({ resume, analysis });
  } catch (err) {
    console.error('Resume analyze error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all resume history
router.get('/history', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .select('-rawText')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(resumes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/latest', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ message: 'No resume found' });
    res.json(resume);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Analyze from text/skills input instead of PDF
router.post('/analyze-text', auth, async (req, res) => {
  try {
    const { skills, experience, education, targetRole, fieldOfInterest } = req.body;
    if (!skills) return res.status(400).json({ message: 'Please enter your skills' });
    if (!targetRole) return res.status(400).json({ message: 'Target role is required' });

    // Build a resume-like text from user input
    const resumeText = `
      Skills: ${skills}
      Experience: ${experience || 'Fresher / No experience yet'}
      Education: ${education || 'Not specified'}
      Target Role: ${targetRole}
      Field: ${fieldOfInterest}
    `;

    const analysis = await analyzeResume(resumeText, fieldOfInterest, targetRole);

    // Save to DB same as PDF upload
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: 'Manual Skills Input',
      fileUrl: '',
      rawText: resumeText,
      targetRole,
      fieldOfInterest,
      analysis
    });

    if (analysis.extractedSkills?.length > 0) {
      await User.findByIdAndUpdate(req.user.id, { skills: analysis.extractedSkills });
    }

    res.json({ resume, analysis });
  } catch (err) {
    console.error('Text analyze error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
