const axios = require('axios');


const priceCache = {
  BTC: { price: 0, lastUpdated: 0 },
  ETH: { price: 0, lastUpdated: 0 },
};

const fetchCryptoPrices = async () => {
  try {

    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');

    const now = Date.now();
    priceCache.BTC = { price: response.data.bitcoin.usd, lastUpdated: now };
    priceCache.ETH = { price: response.data.ethereum.usd, lastUpdated: now };

    console.log('Fetched new crypto prices:', priceCache);

  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    
  }
};


fetchCryptoPrices();


setInterval(fetchCryptoPrices, 20000);


const getPrice = (currency) => {
  return priceCache[currency.toUpperCase()]?.price || 0;
};

module.exports = { getPrice };