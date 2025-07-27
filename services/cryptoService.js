require('dotenv').config(); 
const axios = require('axios');

const priceCache = {
  BTC: { price: 0, lastUpdated: 0 },
  ETH: { price: 0, lastUpdated: 0 },
};

const fetchCryptoPrices = async () => {
  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY,
      },
      params: {
        symbol: 'BTC,ETH',
        convert: 'USD'
      }
    });
    
    const now = Date.now();
    priceCache.BTC = { price: response.data.data.BTC.quote.USD.price, lastUpdated: now };
    priceCache.ETH = { price: response.data.data.ETH.quote.USD.price, lastUpdated: now };
    
    console.log('Fetched new crypto prices from CoinMarketCap:', priceCache);

  } catch (error) {
    console.error('Error fetching crypto prices:', error.response ? error.response.data : error.message);
  }
};

fetchCryptoPrices();

setInterval(fetchCryptoPrices, 60000); 

const getPrice = (currency) => {
  return priceCache[currency.toUpperCase()]?.price || 0;
};

module.exports = { getPrice };