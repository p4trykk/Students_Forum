const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');
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


async function replaceEmoticonsWithImages(content) {
  try {
    // Pobierz emotki z BetterTTV
    const response = await axios.get('https://api.betterttv.net/3/emotes/shared/top?offset=0&limit=50');
    const emoticons = response.data;

    // Mapowanie emotikon na znaczniki obrazka
    let processedContent = content;
    emoticons.forEach(emote => {
      const emoteCode = emote.code;
      const emoteUrl = `https://cdn.betterttv.net/emote/${emote.id}/1x`;
      const emoteImgTag = `<img src="${emoteUrl}" alt="${emoteCode}" title="${emoteCode}" style="width:20px; height:20px;">`;

      // Zamień wszystkie wystąpienia kodu emotki na znacznik <img>
      const regex = new RegExp(`\\b${emoteCode}\\b`, 'g'); // Słowo oddzielone spacjami
      processedContent = processedContent.replace(regex, emoteImgTag);
    });

    return processedContent;
  } catch (error) {
    console.error('Error fetching emoticons:', error.message);
    return content; // Jeśli wystąpi problem, zwróć oryginalną zawartość
  }
}



router.post('/create', authMiddleware, upload.single('attachment'), async (req, res) => {
  const { content, postId } = req.body;

  if (!content || !postId) {
    return res.status(400).json({ message: 'Content and postId are required.' });
  }

  try {

    const processedContent = await replaceEmoticonsWithImages(content);

    const comment = new Comment({
      content: processedContent,
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
    const comments = await Comment.find({ post: postId }).populate('author', 'username avatar');

    const emotesResponse = await axios.get('http://localhost:5000/api/emotes');
    const emotes = emotesResponse.data;

    const emoteMap = {};
    emotes.forEach((emote) => {
      emoteMap[emote.code] = emote.url;
    });

    const enhancedComments = comments.map((comment) => ({
      ...comment.toObject(),
      content: comment.content.replace(/(\b\w+\b)/g, (code) =>
        emoteMap[code] ? `<img src="${emoteMap[code]}" alt="${code}" class="btv-emote" />` : code
      ),
      author: {
        ...comment.author,
        avatar: comment.author.avatar || 'def_icon.jpg',
      },
    }));

    console.log('Enhanced Comments:', enhancedComments);
    res.status(200).json(enhancedComments);
  } catch (err) {
    console.error('Error fetching comments with emoticons:', err.message);
    res.status(500).json({ message: 'Error fetching comments with emoticons.' });
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
