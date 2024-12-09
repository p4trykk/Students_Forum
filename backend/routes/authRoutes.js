const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Katalog, gdzie zapisywane są pliki
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unikalna nazwa pliku
  },
});
const upload = multer({ storage });

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
      token,
      userId: user._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ author: req.user.userId });
    const commentCount = await Comment.countDocuments({ author: req.user.userId });
    

    res.json({
      ...user.toObject(),
      postCount,
      commentCount,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Aktualizacja danych użytkownika
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Obsługa avataru
    if (req.file) {
      // Usuń stary avatar, jeśli istnieje
      if (user.avatar) {
        const oldPath = path.join(__dirname, "..", "uploads", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      user.avatar = req.file.filename;
    }

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



module.exports = router;
