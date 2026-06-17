const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// ── STATIC ROUTES FIRST (must be before /:id) ──────────────────────────────

router.get('/meta/tags', auth, async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(tags);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/leaderboard', auth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name');
    const scoreMap = {};
    posts.forEach(post => {
      const id = post.author?._id?.toString();
      if (!id) return;
      if (!scoreMap[id]) scoreMap[id] = { name: post.author.name, posts: 0, answers: 0, votes: 0 };
      scoreMap[id].posts += 1;
      scoreMap[id].votes += post.votes;
      post.answers.forEach(a => {
        const aid = a.author?.toString();
        if (!aid) return;
        if (!scoreMap[aid]) scoreMap[aid] = { name: 'User', posts: 0, answers: 0, votes: 0 };
        scoreMap[aid].answers += 1;
        scoreMap[aid].votes += a.votes;
      });
    });
    const leaderboard = Object.entries(scoreMap)
      .map(([id, data]) => ({ id, ...data, score: data.posts * 2 + data.answers * 3 + data.votes }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json(leaderboard);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/notifications/all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/notifications/read', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $set: { 'notifications.$[].read': true } });
    res.json({ message: 'Marked all as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── LIST + CREATE ────────────────────────────────────────────────────────────

router.get('/', auth, async (req, res) => {
  try {
    const { tag, search, sort = 'newest', page = 1, limit = 10 } = req.query;
    let query = {};
    if (tag) query.tags = { $in: [tag] };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } }
    ];
    const sortOption = sort === 'votes' ? { votes: -1 } : { createdAt: -1 };
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const post = await Post.create({ title, body: body || '', tags: tags || [], author: req.user.id });
    const populated = await post.populate('author', 'name');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── DYNAMIC :id ROUTES (must be after all static routes) ───────────────────

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate('author', 'name').populate('answers.author', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Answer body required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.answers.push({ author: req.user.id, body });
    await post.save();

    if (post.author.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.author, {
        $push: {
          notifications: {
            message: `Someone answered your question: "${post.title.substring(0, 50)}"`,
            postId: post._id.toString(),
            read: false
          }
        }
      });
    }

    await post.populate('author', 'name');
    await post.populate('answers.author', 'name');
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.votedBy.includes(req.user.id)) {
      post.votes += type === 'up' ? 1 : -1;
      post.votedBy.push(req.user.id);
      await post.save();
    }
    res.json({ votes: post.votes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:postId/answer/:answerId/vote', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const answer = post.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    if (!answer.votedBy) answer.votedBy = [];
    if (!answer.votedBy.includes(req.user.id)) {
      answer.votes += type === 'up' ? 1 : -1;
      answer.votedBy.push(req.user.id);
      await post.save();
    }
    res.json({ votes: answer.votes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:postId/answer/:answerId/accept', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Only post author can accept' });
    post.answers.forEach(a => { a.isAccepted = false; });
    const answer = post.answers.id(req.params.answerId);
    if (answer) answer.isAccepted = true;
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;