const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const GameSession = require('../models/GameSession');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// @route   GET /api/games
// @desc    Get all games with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      provider,
      isFeatured,
      isNew,
      isPopular,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (provider) query.provider = provider;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isNew === 'true') query.isNew = true;
    if (isPopular === 'true') query.isPopular = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const games = await Game.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Game.countDocuments(query);

    // Get unique categories and providers for filters
    const categories = await Game.distinct('category', { isActive: true });
    const providers = await Game.distinct('provider', { isActive: true });

    res.json({
      games,
      filters: { categories, providers },
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

// @route   GET /api/games/featured
// @desc    Get featured games
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true, isFeatured: true })
      .sort({ rating: -1 })
      .limit(10);

    res.json(games);
  } catch (error) {
    console.error('Get featured games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/popular
// @desc    Get popular games
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true, isPopular: true })
      .sort({ playCount: -1 })
      .limit(10);

    res.json(games);
  } catch (error) {
    console.error('Get popular games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/new
// @desc    Get new games
// @access  Public
router.get('/new', async (req, res) => {
  try {
    const games = await Game.find({ isActive: true, isNew: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(games);
  } catch (error) {
    console.error('Get new games error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/categories/all
// @desc    Get all game categories
// @access  Public
router.get('/categories/all', async (req, res) => {
  try {
    const categories = [
      { id: 'slots', name: 'Slots', icon: 'slots', count: await Game.countDocuments({ category: 'slots', isActive: true }) },
      { id: 'table', name: 'Table Games', icon: 'table', count: await Game.countDocuments({ category: 'table', isActive: true }) },
      { id: 'card', name: 'Card Games', icon: 'card', count: await Game.countDocuments({ category: 'card', isActive: true }) },
      { id: 'arcade', name: 'Arcade', icon: 'arcade', count: await Game.countDocuments({ category: 'arcade', isActive: true }) },
      { id: 'live', name: 'Live Casino', icon: 'live', count: await Game.countDocuments({ category: 'live', isActive: true }) },
      { id: 'sports', name: 'Sports', icon: 'sports', count: await Game.countDocuments({ category: 'sports', isActive: true }) }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/games/:id
// @desc    Get single game
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game || !game.isActive) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Increment play count
    game.playCount += 1;
    await game.save();

    res.json(game);
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/:id/play
// @desc    Start playing a game
// @access  Private
router.post('/:id/play', auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game || !game.isActive) {
      return res.status(404).json({ message: 'Game not found' });
    }

    const user = await User.findById(req.user.id);

    // Check if user has sufficient balance
    if (user.wallet.balance + user.wallet.bonus < game.minBet) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create game session
    const session = new GameSession({
      user: user._id,
      game: game._id,
      sessionId: uuidv4(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await session.save();

    res.json({
      sessionId: session.sessionId,
      game: {
        id: game._id,
        name: game.name,
        config: game.config
      },
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Play game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/bet
// @desc    Place a bet
// @access  Private
router.post('/bet', auth, async (req, res) => {
  try {
    const { sessionId, amount } = req.body;

    const session = await GameSession.findOne({
      sessionId,
      user: req.user.id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    const user = await User.findById(req.user.id);
    const game = await Game.findById(session.game);

    // Validate bet amount
    if (amount < game.minBet || amount > game.maxBet) {
      return res.status(400).json({
        message: `Bet must be between ${game.minBet} and ${game.maxBet}`
      });
    }

    // Check balance
    if (user.wallet.balance + user.wallet.bonus < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct from bonus first, then balance
    let remainingAmount = amount;
    let bonusUsed = 0;
    let balanceUsed = 0;

    if (user.wallet.bonus > 0) {
      bonusUsed = Math.min(user.wallet.bonus, amount);
      user.wallet.bonus -= bonusUsed;
      remainingAmount -= bonusUsed;
    }

    if (remainingAmount > 0) {
      balanceUsed = remainingAmount;
      user.wallet.balance -= balanceUsed;
    }

    // Create transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'bet',
      amount: -amount,
      game: game._id,
      gameSession: sessionId,
      beforeBalance: user.wallet.balance + amount,
      afterBalance: user.wallet.balance,
      description: `Bet on ${game.name}`
    });

    await transaction.save();

    // Update session
    session.bets.push({ amount, timestamp: new Date() });
    session.totalBets += amount;

    // Update user stats
    user.stats.gamesPlayed += 1;
    user.stats.totalWagered += amount;

    await Promise.all([user.save(), session.save()]);

    // Simulate game result (in real implementation, this would be handled by game logic)
    const winAmount = Math.random() > 0.5 ? amount * (1 + Math.random() * 2) : 0;

    res.json({
      success: true,
      bet: { amount, bonusUsed, balanceUsed },
      result: { winAmount },
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/win
// @desc    Process a win
// @access  Private
router.post('/win', auth, async (req, res) => {
  try {
    const { sessionId, amount } = req.body;

    const session = await GameSession.findOne({
      sessionId,
      user: req.user.id,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    const user = await User.findById(req.user.id);
    const game = await Game.findById(session.game);

    const beforeBalance = user.wallet.balance;
    user.wallet.balance += amount;

    // Create transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'win',
      amount: amount,
      game: game._id,
      gameSession: sessionId,
      beforeBalance,
      afterBalance: user.wallet.balance,
      description: `Win on ${game.name}`
    });

    await transaction.save();

    // Update session
    const lastBet = session.bets[session.bets.length - 1];
    if (lastBet) {
      lastBet.result = 'win';
      lastBet.winAmount = amount;
    }
    session.totalWins += amount;
    session.netResult = session.totalWins - session.totalBets;

    // Update user stats
    if (amount > 0) {
      user.stats.gamesWon += 1;
      user.stats.totalWon += amount;
    }

    await Promise.all([user.save(), session.save()]);

    res.json({
      success: true,
      win: { amount },
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Process win error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/games/:id/end
// @desc    End game session
// @access  Private
router.post('/:id/end', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await GameSession.findOneAndUpdate(
      { sessionId, user: req.user.id, status: 'active' },
      { status: 'completed', endedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Game session not found' });
    }

    res.json({ message: 'Game session ended', session });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

