const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    inGameName: { type: String, required: true },
    gameUid: { type: String, required: true },
    contact: { type: String, required: true },
    mode: { type: String, default: 'Solo Match' },
    status: { type: String, default: 'WAITING LIST' },
    region: { type: String, default: 'Asia / South' },
    screenshotUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
