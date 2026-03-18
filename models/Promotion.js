const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['welcome_bonus', 'deposit_bonus', 'free_spins', 'cashback', 'loyalty', 'referral', 'tournament'],
    required: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  value: {
    type: Number,
    required: true
  },
  valueType: {
    type: String,
    enum: ['percentage', 'fixed', 'spins'],
    default: 'percentage'
  },
  minDeposit: {
    type: Number,
    default: 0
  },
  maxBonus: {
    type: Number,
    default: null
  },
  wageringRequirement: {
    type: Number,
    default: 30
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  eligibleGames: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  terms: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Promotion', promotionSchema);
