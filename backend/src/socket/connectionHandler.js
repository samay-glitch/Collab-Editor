const documentHandler = require('./documentHandler');
const cursorHandler = require('./cursorHandler');
const SOCKET_EVENTS = require('../../../shared/socketEvents');
const logger = require('../utils/logger');

module.exports = function (io, socket) {
  logger.info(`Socket connected: ${socket.id} (User: ${socket.user.name})`);

  socket.currentRoom = null;

  documentHandler(io, socket);
  cursorHandler(io, socket);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id} (User: ${socket.user.name})`);
    
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit(SOCKET_EVENTS.USER_LEFT, {
        userId: socket.user._id.toString(),
        userName: socket.user.name,
      });
    }
  });
};
