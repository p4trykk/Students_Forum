const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const { createPost } = require('../controllers/postController');
const router = express.Router();


router.post('/create', authMiddleware, async (req, res) => {
  const { title, content, tags } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const post = new Post({
      title,
      content,
      tags,
      author: req.user.userId
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully.', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating post.' });
  }
});

router.put('/edit/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to edit this post.' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.updatedAt = Date.now();

    await post.save();
    res.status(200).json({ message: 'Post updated successfully.', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while editing post.' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username email'); 
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});



module.exports = router;
