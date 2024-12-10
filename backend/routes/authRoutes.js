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
    cb(null, Date.now() + path.extname(file.originalname)); // Unikalna nazwa pliku
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); 
  } else {
    cb(new Error('Not an image! Please upload an image file.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
});

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
    if (!user) {
      console.error('Login failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials: User not found' });
    }
    console.log('Hasło w bazie:', user.password);
    console.log('Przesłane hasło:', password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Czy hasła pasują?', isMatch);

    if (!isMatch) {
      console.error('Login failed: Incorrect password');
      return res.status(400).json({ message: 'Invalid credentials: Incorrect password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful:', user);
    res.json({ 
      token,
      userId: user._id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId; 
    if (!userId) {
      return res.status(400).json({ message: 'Invalid token or user ID missing.' });
    }

    console.log('Fetching profile for userId:', userId);
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.error('User not found for userId:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ author: userId });
    const commentCount = await Comment.countDocuments({ author: userId });

    res.json({
      ...user.toObject(),
      postCount,
      commentCount,
      avatar: user.avatar ? `/uploads/${user.avatar}` : null,
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
    console.log('Before update:', user.password);
    if (password && password.trim() !== '' && password !== user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    console.log('After update:', user.password);
    

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

router.put('/update-password', async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    // Znajdź użytkownika
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sprawdź, czy hasło jest inne
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as the old password' });
    }

    // Haszuj tylko czysty tekst hasła
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Zapisz użytkownika
    await user.save();

    console.log('Hasło zaktualizowane:', user.password);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
