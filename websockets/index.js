const { Server } = require('socket.io');
const { processCashOut } = require('../services/gameService');
let io;

const setupWebsockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", 
    }
  });

  io.on('connection', (socket) => {
    console.log(`A user connected with socket ID: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    
  });
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { setupWebsockets, broadcast };