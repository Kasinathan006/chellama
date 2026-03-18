const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['slots', 'table', 'card', 'arcade', 'live', 'sports'],
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  banner: {
    type: String,
    default: ''
  },
  provider: {
    type: String,
    required: true
  },
  rtp: {
    type: Number,
    default: 96.0
  },
  volatility: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  minBet: {
    type: Number,
    default: 0.10
  },
  maxBet: {
    type: Number,
    default: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  playCount: {
    type: Number,
    default: 0
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Game', gameSchema);
