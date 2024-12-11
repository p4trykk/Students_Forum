const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const { createPost } = require('../controllers/postController');
const router = express.Router();


router.post('/create', authMiddleware, async (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content || !tags) {
    return res.status(400).json({ message: 'Title, content, and tags are required.' });
  }

  try {
    const post = new Post({
      title,
      content,
      tags, 
      author: req.user.userId, 
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully.', post });
  } catch (err) {
    console.error('Error while creating post:', err.message);
    res.status(500).json({ message: 'Server error while creating post.', error: err.message });
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

    if (post.userId.toString() !== req.user.userId) {
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
  const userId = req.user?.userId; 

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing in request.' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isLiked = post.likes.some((id) => id?.toString() === userId?.toString());
    if (isLiked) {
      post.likes = post.likes.filter((id) => id?.toString() !== userId?.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ message: 'Post liked/unliked successfully.', likes: post.likes });
  } catch (err) {
    console.error('Error in like/unlike:', err.message); 
    res.status(500).json({ message: 'Server error while liking/unliking post.', error: err.message });
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

    const posts = await Post.find(query).populate('author', 'username email avatar');
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error searching posts:', err);
    res.status(500).json({ message: 'Error searching posts' });
  }
});

router.get('/tags', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find();
    const tagCount = {};

    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sortowanie po popularności

    res.status(200).json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

// Endpoint: Pobranie postów dla konkretnego tagu
router.get('/tags/:tag', authMiddleware, async (req, res) => {
  const { tag } = req.params;

  try {
    const posts = await Post.find({ tags: req.params.tag })
      .populate('author', 'username email avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }, // Pobiera dane autora komentarza
      });

    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts by tag:', err);
    res.status(500).json({ message: 'Error fetching posts by tag' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate('author', 'username email avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username email avatar'); 
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username email avatar');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err });
  }
});




module.exports = router;
