const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const Transaction = require('../models/Transaction');
const GameSession = require('../models/GameSession');
const Promotion = require('../models/Promotion');
const Notification = require('../models/Notification');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      totalGames,
      activeGames,
      totalTransactions,
      todayDeposits,
      todayWithdrawals,
      todayBets,
      pendingWithdrawals,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Game.countDocuments(),
      Game.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'withdrawal', status: 'completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'bet', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
      ]),
      Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
      Transaction.aggregate([
        { $match: { type: 'deposit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt wallet.balance');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username')
      .select('type amount status createdAt');

    res.json({
      stats: {
        totalUsers,
        newUsersToday,
        totalGames,
        activeGames,
        totalTransactions,
        todayDeposits: todayDeposits[0]?.total || 0,
        todayWithdrawals: todayWithdrawals[0]?.total || 0,
        todayBets: todayBets[0]?.total || 0,
        pendingWithdrawals,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Admin
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Admin
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user transactions
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Get user game sessions
    const sessions = await GameSession.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('game', 'name');

    res.json({
      user,
      transactions,
      sessions
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { role, isActive, wallet, vipLevel } = req.body;

    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (vipLevel !== undefined) updates.vipLevel = vipLevel;
    if (wallet) {
      const user = await User.findById(req.params.id);
      if (wallet.balance !== undefined) {
        // Create transaction for balance adjustment
        const diff = wallet.balance - user.wallet.balance;
        if (diff !== 0) {
          const transaction = new Transaction({
            user: user._id,
            type: diff > 0 ? 'deposit' : 'withdrawal',
            amount: Math.abs(diff),
            status: 'completed',
            description: `Admin balance adjustment by ${req.user.username}`,
            processedBy: req.user.id
          });
          await transaction.save();
        }
        updates['wallet.balance'] = wallet.balance;
      }
      if (wallet.bonus !== undefined) updates['wallet.bonus'] = wallet.bonus;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/games
// @desc    Get all games
// @access  Admin
router.get('/games', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const games = await Game.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Game.countDocuments();

    res.json({
      games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/games
// @desc    Create new game
// @access  Admin
router.post('/games', adminAuth, async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/games/:id
// @desc    Update game
// @access  Admin
router.put('/games/:id', adminAuth, async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/games/:id
// @desc    Delete game
// @access  Admin
router.delete('/games/:id', adminAuth, async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/transactions
// @desc    Get all transactions
// @access  Admin
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, userId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.user = userId;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username email');

    const total = await Transaction.countDocuments(query);

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
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/transactions/:id
// @desc    Update transaction status
// @access  Admin
router.put('/transactions/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status, processedBy: req.user.id, completedAt: status === 'completed' ? new Date() : null },
      { new: true }
    ).populate('user', 'username email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If approving a withdrawal, deduct from user balance
    if (status === 'completed' && transaction.type === 'withdrawal') {
      const user = await User.findById(transaction.user);
      // Balance already deducted when withdrawal was requested
    }

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/promotions
// @desc    Get all promotions
// @access  Admin
router.get('/promotions', adminAuth, async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.json(promotions);
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/promotions
// @desc    Create promotion
// @access  Admin
router.post('/promotions', adminAuth, async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/promotions/:id
// @desc    Update promotion
// @access  Admin
router.put('/promotions/:id', adminAuth, async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(promotion);
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/notifications
// @desc    Send notification to users
// @access  Admin
router.post('/notifications', adminAuth, async (req, res) => {
  try {
    const { title, message, type, userIds, sendToAll } = req.body;

    if (sendToAll) {
      const users = await User.find({ isActive: true });
      const notifications = users.map(user => ({
        user: user._id,
        title,
        message,
        type
      }));
      await Notification.insertMany(notifications);
    } else if (userIds && userIds.length > 0) {
      const notifications = userIds.map(userId => ({
        user: userId,
        title,
        message,
        type
      }));
      await Notification.insertMany(notifications);
    }

    res.json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/reports/financial
// @desc    Get financial reports
// @access  Admin
router.get('/reports/financial', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const report = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            type: '$type',
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    res.json(report);
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
