const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type!'));
  }
};

const upload = multer({ storage, fileFilter });


router.post('/create', authMiddleware, upload.single('attachment'), async (req, res) => {
  const { content, postId } = req.body;

  if (!content || !postId) {
    return res.status(400).json({ message: 'Content and postId are required.' });
  }

  try {
    const comment = new Comment({
      content,
      author: req.user?.userId, 
      post: postId,
      attachment: req.file ? req.file.filename : null,
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
    const comments = await Comment.find({ post: postId })
      .populate('author', 'username avatar');
    
    const enhancedComments = comments.map((comment) => ({
      ...comment.toObject(),
      author: {
        ...comment.author,
        avatar: comment.author.avatar || 'def_icon.jpg', 
      },
    }));
    console.log("Fetched comments with enhanced avatar fallback:", enhancedComments);
    res.status(200).json(enhancedComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching comments.' });
  }
});


router.get('/comments/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ post: postId })
      .populate('author', 'username avatar')
      .populate('post', 'title');

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err });
  }
});


module.exports = router;
