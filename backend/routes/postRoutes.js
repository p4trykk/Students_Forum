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

router.post('/like/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: 'Post liked/unliked successfully.', likes: post.likes }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while liking post.' });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  const { title, tags } = req.query;

  try {
    const query = {};
    
    if (title) {
      query.title = { $regex: title, $options: 'i' }; // Wyszukiwanie po tytule (case-insensitive)
    }
    if (tags) {
      query.tags = { $in: tags.split(',').map(tag => tag.trim()) }; // Wyszukiwanie po tagach
    }

    const posts = await Post.find(query).populate('author', 'username email');
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ message: 'Error searching posts' });
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
