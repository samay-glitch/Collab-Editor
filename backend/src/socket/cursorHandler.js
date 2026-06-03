const SOCKET_EVENTS = require('../../../shared/socketEvents');

module.exports = function (io, socket) {
  socket.on(SOCKET_EVENTS.CURSOR_MOVE, ({ documentId, position, color }) => {
    if (!documentId) return;

    socket.to(documentId).emit(SOCKET_EVENTS.CURSOR_UPDATE, {
      userId: socket.user._id,
      userName: socket.user.name,
      position,
      color,
    });
  });
};
