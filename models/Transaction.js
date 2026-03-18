const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'refund', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    default: null
  },
  gameSession: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'paypal', 'skrill', 'neteller', 'internal'],
    default: 'internal'
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  beforeBalance: {
    type: Number,
    default: 0
  },
  afterBalance: {
    type: Number,
    default: 0
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
