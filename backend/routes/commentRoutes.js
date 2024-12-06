const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Dodawanie komentarza
router.post('/create', authMiddleware, async (req, res) => {
  const { content, postId } = req.body;

  if (!content || !postId) {
    return res.status(400).json({ message: 'Content and postId are required.' });
  }

  try {
    const comment = new Comment({
      content,
      author: req.user.userId,
      post: postId
    });

    await comment.save();
    res.status(201).json({ message: 'Comment added successfully.', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding comment.' });
  }
});

router.get('/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ post: postId }).populate('author', 'username');
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching comments.' });
  }
});

module.exports = router;
