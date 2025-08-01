const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  transactionType: { type: String, enum: ['bet', 'cashout'] },
  transactionHash: String, 
  priceAtTime: Number, 
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);