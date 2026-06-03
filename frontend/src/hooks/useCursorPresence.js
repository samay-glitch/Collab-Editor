import { useState, useEffect, useCallback, useRef } from 'react';
import useSocket from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';

const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
];

export default function useCursorPresence(documentId) {
  const [remoteCursors, setRemoteCursors] = useState(new Map());
  const { socket, isConnected } = useSocket();
  const socketRef = useRef(socket);
  const colorRef = useRef(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !isConnected || !documentId) return;

    // Remote cursor position updates
    currentSocket.on(SOCKET_EVENTS.CURSOR_UPDATE, ({ userId, userName, position, color }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        if (position) {
          next.set(userId, { userName, position, color });
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    // Remove cursor when a user leaves
    currentSocket.on(SOCKET_EVENTS.USER_LEFT, ({ userId }) => {
      setRemoteCursors((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      if (currentSocket) {
        currentSocket.off(SOCKET_EVENTS.CURSOR_UPDATE);
        currentSocket.off(SOCKET_EVENTS.USER_LEFT);
      }
    };
  }, [documentId, isConnected]);

  const broadcastCursor = useCallback((position) => {
    if (socketRef.current && isConnected && documentId) {
      socketRef.current.emit(SOCKET_EVENTS.CURSOR_MOVE, {
        documentId,
        position,
        color: colorRef.current,
      });
    }
  }, [documentId, isConnected]);

  return {
    remoteCursors,
    broadcastCursor,
    localColor: colorRef.current,
  };
}
