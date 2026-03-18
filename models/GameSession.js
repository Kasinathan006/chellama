const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  bets: [{
    amount: Number,
    timestamp: { type: Date, default: Date.now },
    result: String,
    winAmount: Number
  }],
  totalBets: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  netResult: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

module.exports = mongoose.model('GameSession', gameSessionSchema);
