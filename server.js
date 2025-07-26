const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const { setupWebsockets, broadcast } = require('./websockets');
const gameService = require('./services/gameService');


const app = express();
const server = http.createServer(app);


setupWebsockets(server);


gameService.setBroadcast(broadcast);


app.use(express.json());
app.use(express.static('public'));


app.use('/api', require('./routes/api'));


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  
  connectDB().then(() => {
    gameService.startGame();
  });
});