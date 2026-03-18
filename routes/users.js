const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   GET /api/users/leaderboard
// @desc    Get top players leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPlayers = await User.find({ isActive: true })
      .sort({ 'stats.totalWon': -1 })
      .limit(parseInt(limit))
      .select('username avatar stats vipLevel');

    res.json(topPlayers);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/profile/:username
// @desc    Get public user profile
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true })
      .select('username avatar stats vipLevel createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/history
// @desc    Get user game history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('game', 'name thumbnail');

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { user: req.user.id };
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Notifications update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get detailed user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get additional stats
    const totalDeposits = await Transaction.aggregate([
      { $match: { user: user._id, type: 'deposit', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWithdrawals = await Transaction.aggregate([
      { $match: { user: user._id, type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalBets = await Transaction.aggregate([
      { $match: { user: user._id, type: 'bet' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalWins = await Transaction.aggregate([
      { $match: { user: user._id, type: 'win' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      stats: user.stats,
      financial: {
        totalDeposits: totalDeposits[0]?.total || 0,
        totalWithdrawals: totalWithdrawals[0]?.total || 0,
        totalBets: totalBets[0]?.total || 0,
        totalWins: totalWins[0]?.total || 0,
        netProfit: (totalWins[0]?.total || 0) - (totalBets[0]?.total || 0)
      },
      vipLevel: user.vipLevel,
      memberSince: user.createdAt
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
