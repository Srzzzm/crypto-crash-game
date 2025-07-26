const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { getPrice } = require('../services/cryptoService');
const gameService = require('../services/gameService'); 

router.post('/setup/user', async (req, res) => {
  try {
    let user = await User.findOne({ username: 'testuser1' });
    if (user) {
      return res.json({ msg: 'Test user already exists.', user });
    }
    user = new User({
      username: 'testuser1',
      wallet: { BTC: 0.1, ETH: 2 },
    });
    await user.save();
    res.status(201).json({ msg: 'Test user created successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/wallet/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const btcPrice = getPrice('BTC');
    const ethPrice = getPrice('ETH');
    const walletUSDValue = {
      BTC_USD: user.wallet.BTC * btcPrice,
      ETH_USD: user.wallet.ETH * ethPrice,
      Total_USD: (user.wallet.BTC * btcPrice) + (user.wallet.ETH * ethPrice),
    };
    res.json({
      username: user.username,
      wallet: user.wallet,
      walletUSD: walletUSDValue,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post('/bet', async (req, res) => {
  const { userId, amountUSD, currency } = req.body;
  if (!userId || !amountUSD || !currency) {
    return res.status(400).json({ msg: 'Please provide userId, amountUSD, and currency' });
  }
  if (amountUSD <= 0) {
    return res.status(400).json({ msg: 'Bet amount must be positive' });
  }
  const supportedCurrencies = ['BTC', 'ETH'];
  if (!supportedCurrencies.includes(currency.toUpperCase())) {
    return res.status(400).json({ msg: 'Unsupported currency. Please use BTC or ETH' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const price = getPrice(currency);
    if (price === 0) {
      return res.status(500).json({ msg: 'Could not retrieve crypto price.' });
    }
    const amountCrypto = amountUSD / price;
    if (user.wallet[currency] < amountCrypto) {
      return res.status(400).json({ msg: 'Insufficient funds' });
    }
    user.wallet[currency] -= amountCrypto;
    await user.save();
    const transaction = new Transaction({
      userId: userId,
      usdAmount: amountUSD,
      cryptoAmount: amountCrypto,
      currency: currency,
      transactionType: 'bet',
      transactionHash: 'mock_hash_' + Date.now(),
      priceAtTime: price,
    });
    await transaction.save();
    
    
    gameService.addLiveBet(transaction); 

    res.json({
      msg: 'Bet placed successfully',
      newBalance: user.wallet,
      bet: transaction,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;