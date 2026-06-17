const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const { generateInterviewQuestions, evaluateAnswer, generateOverallFeedback } = require('../services/groqService');

// Start new interview - generate questions
router.post('/start', auth, async (req, res) => {
  try {
    const { role, details } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const data = await generateInterviewQuestions(role, details);

    const interview = await Interview.create({
      userId: req.user.id,
      role,
      details: details || '',
      questions: data.questions.map(q => ({ question: q.question, userAnswer: '', feedback: '', score: 0 }))
    });

    res.json({ interviewId: interview._id, questions: data.questions, role });
  } catch (err) {
    console.error('Interview start error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Submit answer for a question
router.post('/answer', auth, async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const question = interview.questions[questionIndex]?.question;
    if (!question) return res.status(400).json({ message: 'Invalid question index' });

    const evaluation = await evaluateAnswer(question, answer, interview.role);

    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].feedback = evaluation.feedback;
    interview.questions[questionIndex].score = evaluation.score;
    interview.markModified('questions');
    await interview.save();

    res.json({ evaluation, questionIndex });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete interview and get overall feedback
router.post('/complete', auth, async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const answeredQuestions = interview.questions.filter(q => q.userAnswer);
    const overallData = await generateOverallFeedback(interview.role, answeredQuestions.map(q => ({ question: q.question, score: q.score })));

    const totalScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0) / (answeredQuestions.length || 1);

    interview.totalScore = Math.round(totalScore * 10) / 10;
    interview.overallFeedback = JSON.stringify(overallData);
    interview.completed = true;
    await interview.save();

    res.json({ interview, overallData, totalScore: interview.totalScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get interview history
router.get('/history', auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.id, completed: true }).sort({ createdAt: -1 }).limit(10);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single interview
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Not found' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
