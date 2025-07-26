const crypto = require('crypto');
const User = require('../models/user');
const Transaction = require('../models/transaction');

let broadcast;
const setBroadcast = (fn) => {
  broadcast = fn;
};

let gameState = {
  status: 'waiting',
  multiplier: 1.00,
  crashPoint: null,
  liveBets: {},
};

const serverSeed = crypto.randomBytes(32).toString('hex');
let roundNumber = 0;

const generateCrashPoint = () => {
  roundNumber++;
  const hash = crypto.createHash('sha256').update(serverSeed + roundNumber).digest('hex');
  const hashInt = parseInt(hash.substring(0, 8), 16);
  const crashNumber = Math.max(1, hashInt / (2**32 - 1) * 100);
  return Math.floor(crashNumber * 100) / 100;
};

// ... (addLiveBet and processCashOut functions remain the same) ...
const addLiveBet = (bet) => {
  if (gameState.status !== 'waiting') {
    return { error: 'Betting is currently closed.' };
  }
  gameState.liveBets[bet.userId] = {
    amountCrypto: bet.cryptoAmount,
    currency: bet.currency,
    priceAtTime: bet.priceAtTime,
    cashedOut: false,
    cashoutMultiplier: null,
  };
  return { success: true };
};

const processCashOut = async (socket, userId) => {
  if (gameState.status !== 'running') {
    return socket.emit('cashout_fail', { msg: 'Not a running game.' });
  }
  const bet = gameState.liveBets[userId];
  if (!bet || bet.cashedOut) {
    return socket.emit('cashout_fail', { msg: 'No active bet or already cashed out.' });
  }
  const cashoutMultiplier = gameState.multiplier;
  const winningsCrypto = bet.amountCrypto * cashoutMultiplier;
  const winningsUSD = winningsCrypto * bet.priceAtTime;
  bet.cashedOut = true;
  bet.cashoutMultiplier = cashoutMultiplier;
  try {
    const user = await User.findById(userId);
    user.wallet[bet.currency] += winningsCrypto;
    await user.save();
    const transaction = new Transaction({
      userId: userId,
      usdAmount: winningsUSD,
      cryptoAmount: winningsCrypto,
      currency: bet.currency,
      transactionType: 'cashout',
      transactionHash: 'mock_hash_cashout_' + Date.now(),
      priceAtTime: bet.priceAtTime,
    });
    await transaction.save();
    socket.emit('cashout_success', { cashoutMultiplier, winningsUSD });
    broadcast('player_cashed_out', { username: user.username, cashoutMultiplier });
  } catch (err) {
    console.error('Cashout error:', err);
    socket.emit('cashout_fail', { msg: 'Server error during cashout.' });
  }
};


const runGameCycle = () => {
  const startTime = Date.now();
  console.log(`--- ROUND ${roundNumber} STARTED ---`);
  gameState.status = 'running';
  broadcast('round_started', { startTime });

  const multiplierInterval = setInterval(() => {
    // First, check if we should crash
    if (gameState.multiplier >= gameState.crashPoint) {
      clearInterval(multiplierInterval);
      gameState.status = 'crashed';
      console.log(`--- ROUND ${roundNumber} CRASHED AT ${gameState.crashPoint}x ---`);
      broadcast('crash', { crashPoint: gameState.crashPoint });

      // Start the next round after a delay
      setTimeout(() => {
        gameState.status = 'waiting';
        gameState.crashPoint = generateCrashPoint();
        gameState.multiplier = 1.00;
        gameState.liveBets = {};
        console.log(`--- NEW ROUND ${roundNumber + 1} WILL START SOON ---`);
        console.log(`Next crash point will be: ${gameState.crashPoint}x`);
        broadcast('round_starting', { nextRoundIn: 5000 });

        setTimeout(runGameCycle, 5000); // Wait 5s then start the next game
      }, 5000); // 5s crash display period

      return; // Stop execution for this interval
    }

    // If not crashed, update the multiplier
    const timeElapsed = (Date.now() - startTime) / 1000;
    const growth_factor = 0.06;
    gameState.multiplier = parseFloat((1 + timeElapsed * growth_factor).toFixed(2));
    broadcast('multiplier_update', { multiplier: gameState.multiplier });

  }, 100);
};

const startGame = () => {
  gameState.crashPoint = generateCrashPoint();
  console.log(`Next crash point will be: ${gameState.crashPoint}x`);
  // Initial delay before the first round starts
  setTimeout(runGameCycle, 5000);
};

module.exports = {
  setBroadcast,
  startGame,
  addLiveBet,
  processCashOut,
};