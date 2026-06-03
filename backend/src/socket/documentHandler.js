const documentService = require('../services/documentService');
const SOCKET_EVENTS = require('../../../shared/socketEvents');
const Document = require('../models/Document');
const logger = require('../utils/logger');

module.exports = function (io, socket) {
  const saveDebounces = {};

  // 1. Join Document Room
  socket.on(SOCKET_EVENTS.JOIN_DOCUMENT, async ({ documentId }) => {
    try {
      const doc = await documentService.getDocumentById(documentId, socket.user._id);
      
      // Leave previous room if any
      if (socket.currentRoom && socket.currentRoom !== documentId) {
        socket.leave(socket.currentRoom);
        socket.to(socket.currentRoom).emit(SOCKET_EVENTS.USER_LEFT, {
          userId: socket.user._id.toString(),
          userName: socket.user.name,
        });
      }

      socket.join(documentId);
      socket.currentRoom = documentId;
      
      logger.info(`User ${socket.user.name} joined document room: ${documentId}`);

      // Emit document loaded state to joining client
      socket.emit(SOCKET_EVENTS.DOCUMENT_LOADED, doc);

      // Notify others in room of user join
      socket.to(documentId).emit(SOCKET_EVENTS.USER_JOINED, {
        userId: socket.user._id.toString(),
        userName: socket.user.name,
        avatar: socket.user.avatar,
      });

      // Get list of active collaborators in this room
      const clients = io.sockets.adapter.rooms.get(documentId);
      const activeUsers = [];
      let currentUserFound = false;

      if (clients) {
        for (const clientId of clients) {
          const clientSocket = io.sockets.sockets.get(clientId);
          if (clientSocket && clientSocket.user) {
            const isCurrentUser = clientSocket.user._id.toString() === socket.user._id.toString();
            if (isCurrentUser) {
              currentUserFound = true;
            }
            if (!activeUsers.some((u) => u.userId === clientSocket.user._id.toString())) {
              activeUsers.push({
                userId: clientSocket.user._id.toString(),
                userName: clientSocket.user.name,
                avatar: clientSocket.user.avatar,
              });
            }
          }
        }
      }

      if (!currentUserFound) {
        activeUsers.push({
          userId: socket.user._id.toString(),
          userName: socket.user.name,
          avatar: socket.user.avatar,
        });
      }

      socket.emit(SOCKET_EVENTS.PRESENCE_LIST, activeUsers);

    } catch (err) {
      logger.error(`Error joining room: ${err.message}`);
      socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: err.message });
    }
  });

  // 2. Real-Time Text Changes
  socket.on(SOCKET_EVENTS.DOCUMENT_CHANGE, ({ documentId, content }) => {
    socket.to(documentId).emit(SOCKET_EVENTS.DOCUMENT_UPDATE, { content });

    // Auto-save debounce (save to MongoDB after 2 seconds of inactivity)
    if (saveDebounces[documentId]) {
      clearTimeout(saveDebounces[documentId]);
    }

    saveDebounces[documentId] = setTimeout(async () => {
      try {
        const savedDoc = await documentService.updateDocument(documentId, { content }, socket.user._id);
        io.to(documentId).emit(SOCKET_EVENTS.DOCUMENT_SAVED, {
          version: savedDoc.version,
          lastEditedBy: savedDoc.lastEditedBy,
          updatedAt: savedDoc.updatedAt,
        });
        logger.debug(`Auto-saved document: ${documentId}`);
        delete saveDebounces[documentId];
      } catch (err) {
        logger.error(`Auto-save error: ${err.message}`);
      }
    }, 2000);
  });

  // 3. User Typing Indicators
  socket.on(SOCKET_EVENTS.TYPING, ({ documentId, isTyping }) => {
    if (!documentId) return;
    socket.to(documentId).emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.user._id,
      userName: socket.user.name,
      isTyping,
    });
  });

  // 4. Manual Document Save Trigger
  socket.on(SOCKET_EVENTS.SAVE_DOCUMENT, async ({ documentId, content }) => {
    if (!documentId) return;
    try {
      if (saveDebounces[documentId]) {
        clearTimeout(saveDebounces[documentId]);
        delete saveDebounces[documentId];
      }
      const savedDoc = await documentService.updateDocument(documentId, { content }, socket.user._id);
      io.to(documentId).emit(SOCKET_EVENTS.DOCUMENT_SAVED, {
        version: savedDoc.version,
        lastEditedBy: savedDoc.lastEditedBy,
        updatedAt: savedDoc.updatedAt,
      });
      logger.info(`Manual save successful for document: ${documentId}`);
    } catch (err) {
      logger.error(`Manual save error: ${err.message}`);
    }
  });

  // 5. Leave Document Room
  socket.on(SOCKET_EVENTS.LEAVE_DOCUMENT, ({ documentId }) => {
    socket.leave(documentId);
    if (socket.currentRoom === documentId) {
      socket.currentRoom = null;
    }
    logger.info(`User ${socket.user.name} left document room: ${documentId}`);
    socket.to(documentId).emit(SOCKET_EVENTS.USER_LEFT, {
      userId: socket.user._id.toString(),
      userName: socket.user.name,
    });
  });
};
