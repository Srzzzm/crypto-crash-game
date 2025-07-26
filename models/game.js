const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  roundId: { type: String, required: true, unique: true },
  crashPoint: { type: Number, required: true },
  
  seed: { type: String, required: true },
  hash: { type: String, required: true },
  bets: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String, 


    betAmountUSD: Number,
    betAmountCrypto: Number,
    currency: String,
    cashedOut: { type: Boolean, default: false },
    cashoutMultiplier: { type: Number, default: null },

    payoutCrypto: { type: Number, default: 0 },
    payoutUSD: { type: Number, default: 0 }
  }],

  startTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Game', GameSchema) ;