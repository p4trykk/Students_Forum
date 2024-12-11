const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res) => {
  const { content, postId } = req.body;

  if (!content || !postId) {
    return res.status(400).json({ message: 'Content and postId are required.' });
  }

  try {
    const comment = new Comment({
      content,
      author: req.user?.userId, // Use correct user ID from authMiddleware
      post: postId,
    });

    await comment.save();

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar');
    res.status(201).json({ message: 'Comment added successfully.', comment: populatedComment });
  } catch (err) {
    console.error('Error while adding comment:', err);
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

router.get('/comments/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username email')
      .populate('post', 'title');

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err });
  }
});


module.exports = router;
