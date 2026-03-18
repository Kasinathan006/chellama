const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wallet');
    res.json({
      balance: user.wallet.balance,
      bonus: user.wallet.bonus,
      currency: user.wallet.currency,
      total: user.wallet.balance + user.wallet.bonus
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wallet/deposit
// @desc    Create deposit request
// @access  Private
router.post('/deposit', auth, [
  body('amount').isFloat({ min: 10 }).withMessage('Minimum deposit is $10'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'paypal', 'skrill', 'neteller']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, paymentMethod, paymentDetails } = req.body;

    const user = await User.findById(req.user.id);

    // Create pending deposit transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      paymentMethod,
      paymentDetails,
      beforeBalance: user.wallet.balance,
      afterBalance: user.wallet.balance,
      description: `Deposit via ${paymentMethod}`
    });

    await transaction.save();

    res.json({
      message: 'Deposit request created. Please complete the payment.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wallet/withdraw
// @desc    Create withdrawal request
// @access  Private
router.post('/withdraw', auth, [
  body('amount').isFloat({ min: 20 }).withMessage('Minimum withdrawal is $20'),
  body('paymentMethod').isIn(['bank_transfer', 'crypto', 'paypal', 'skrill', 'neteller']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, paymentMethod, paymentDetails } = req.body;

    const user = await User.findById(req.user.id);

    // Check if user has sufficient balance
    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct from balance immediately
    const beforeBalance = user.wallet.balance;
    user.wallet.balance -= amount;
    await user.save();

    // Create withdrawal transaction
    const transaction = new Transaction({
      user: user._id,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      paymentMethod,
      paymentDetails,
      beforeBalance,
      afterBalance: user.wallet.balance,
      description: `Withdrawal via ${paymentMethod}`
    });

    await transaction.save();

    res.json({
      message: 'Withdrawal request submitted and is pending approval.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod
      },
      wallet: user.wallet
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/wallet/transactions
// @desc    Get transaction history
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const query = { user: req.user.id };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('game', 'name');

    const total = await Transaction.countDocuments(query);

    // Calculate totals
    const totals = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      transactions,
      totals: totals.reduce((acc, curr) => {
        acc[curr._id] = curr.total;
        return acc;
      }, {}),
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

// @route   GET /api/wallet/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/transactions/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('game', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/wallet/transfer
// @desc    Transfer funds to another user
// @access  Private
router.post('/transfer', auth, [
  body('amount').isFloat({ min: 1 }).withMessage('Minimum transfer is $1'),
  body('recipientUsername').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, recipientUsername } = req.body;

    const sender = await User.findById(req.user.id);
    const recipient = await User.findOne({ username: recipientUsername });

    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    if (sender.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Duct from sender
    const senderBeforeBalance = sender.wallet.balance;
    sender.wallet.balance -= amount;
    await sender.save();

    // Add to recipient
    const recipientBeforeBalance = recipient.wallet.balance;
    recipient.wallet.balance += amount;
    await recipient.save();

    // Create transactions for both
    const senderTransaction = new Transaction({
      user: sender._id,
      type: 'transfer',
      amount: -amount,
      status: 'completed',
      beforeBalance: senderBeforeBalance,
      afterBalance: sender.wallet.balance,
      description: `Transfer to ${recipientUsername}`
    });

    const recipientTransaction = new Transaction({
      user: recipient._id,
      type: 'transfer',
      amount: amount,
      status: 'completed',
      beforeBalance: recipientBeforeBalance,
      afterBalance: recipient.wallet.balance,
      description: `Transfer from ${sender.username}`
    });

    await Promise.all([senderTransaction.save(), recipientTransaction.save()]);

    res.json({
      message: 'Transfer completed successfully',
      transaction: {
        id: senderTransaction._id,
        amount: -amount,
        recipient: recipientUsername
      },
      wallet: sender.wallet
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
