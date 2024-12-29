const express = require('express');
const User = require('../models/User');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/update-badges', async (req, res) => {
  try {
    const users = await User.find(); // Pobieramy wszystkich użytkowników
    
    for (const user of users) {
      const commentCount = await Comment.countDocuments({ author: user._id });
      
      const badges = [];
      
      // Odznaczenie "Komentator Miesiąca" (najwięcej komentarzy w ciągu ostatnich 30 dni)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthlyComments = await Comment.countDocuments({ 
        author: user._id, 
        createdAt: { $gte: monthAgo } 
      });

      const mostActiveUser = await Comment.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: '$author', commentCount: { $sum: 1 } } },
        { $sort: { commentCount: -1 } },
        { $limit: 1 },
      ]);

      if (mostActiveUser.length && mostActiveUser[0]._id.toString() === user._id.toString()) {
        badges.push('Komentator Miesiąca');
      }
      
      // Odznaczenie za 10+ komentarzy
      if (commentCount >= 10) {
        badges.push('10+ Komentarzy');
      }

      user.badges = badges;
      await user.save();
    }

    res.status(200).json({ message: 'Badges updated successfully.' });
  } catch (err) {
    console.error('Error updating badges:', err);
    res.status(500).json({ message: 'Error updating badges', error: err });
  }
});

module.exports = router;
