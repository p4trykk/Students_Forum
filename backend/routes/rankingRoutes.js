const express = require('express');
const User = require('../models/User');
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Ranking globalny
router.get('/global', async (req, res) => {
  try {
    const rankings = await User.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'author',
          as: 'userComments',
        },
      },
      {
        $addFields: { commentCount: { $size: '$userComments' } },
      },
      {
        $project: { username: 1, avatar: 1, commentCount: 1 },
      },
      { $sort: { commentCount: -1 } }, // Sortowanie po liczbie komentarzy
      { $limit: 15 }, // Max 15 użytkowników
    ]);

    res.json(rankings);
  } catch (err) {
    console.error('Error fetching global rankings:', err);
    res.status(500).json({ message: 'Server error fetching rankings.' });
  }
});

// Ranking miesięczny (ostatnie 30 dni)
router.get('/monthly', async (req, res) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  try {
    const rankings = await User.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'author',
          as: 'userComments',
        },
      },
      {
        $addFields: {
          recentComments: {
            $filter: {
              input: '$userComments',
              as: 'comment',
              cond: { $gte: ['$$comment.createdAt', oneMonthAgo] },
            },
          },
        },
      },
      {
        $addFields: { commentCount: { $size: '$recentComments' } },
      },
      {
        $project: { username: 1, avatar: 1, commentCount: 1 },
      },
      { $sort: { commentCount: -1 } },
      { $limit: 15 },
    ]);

    res.json(rankings);
  } catch (err) {
    console.error('Error fetching monthly rankings:', err);
    res.status(500).json({ message: 'Server error fetching rankings.' });
  }
});

module.exports = router;
