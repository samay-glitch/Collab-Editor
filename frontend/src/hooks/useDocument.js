import { useState, useEffect, useCallback, useRef } from 'react';
import * as docApi from '../api/documentApi';
import useSocket from './useSocket';
import { SOCKET_EVENTS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function useDocument(documentId) {
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket, isConnected } = useSocket();
  const socketRef = useRef(socket);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // ─── Fetch document via REST on mount ──────────────────
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setIsLoading(true);
        const res = await docApi.getDocument(documentId);
        setDocument(res.data);
      } catch (err) {
        toast.error('Failed to load document');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchDoc();
    }
  }, [documentId]);

  // ─── Socket.IO real-time listeners ─────────────────────
  useEffect(() => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !isConnected || !documentId) return;

    // Join the document room
    currentSocket.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId });

    // Server loaded the document
    currentSocket.on(SOCKET_EVENTS.DOCUMENT_LOADED, (loadedDoc) => {
      setDocument(loadedDoc);
    });

    // Another user changed the document content
    currentSocket.on(SOCKET_EVENTS.DOCUMENT_UPDATE, ({ content }) => {
      setDocument((prev) => (prev ? { ...prev, content } : null));
    });

    // Document was auto-saved to DB
    currentSocket.on(SOCKET_EVENTS.DOCUMENT_SAVED, () => {
      setIsSaving(false);
    });

    // Full list of currently active users
    currentSocket.on(SOCKET_EVENTS.PRESENCE_LIST, (users) => {
      setActiveUsers(users);
    });

    // A user joined the document room
    currentSocket.on(SOCKET_EVENTS.USER_JOINED, ({ userId, userName, avatar }) => {
      setActiveUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, userName, avatar }];
      });
      toast.success(`${userName} joined`, { duration: 2000, icon: '👋' });
    });

    // A user left the document room
    currentSocket.on(SOCKET_EVENTS.USER_LEFT, ({ userId, userName }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
      if (userName) {
        toast(`${userName} left`, { duration: 2000, icon: '🚪' });
      }
    });

    // Typing indicator from another user
    currentSocket.on(SOCKET_EVENTS.USER_TYPING, ({ userId, userName, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (prev.some((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    });

    return () => {
      if (currentSocket) {
        currentSocket.emit(SOCKET_EVENTS.LEAVE_DOCUMENT, { documentId });
        currentSocket.off(SOCKET_EVENTS.DOCUMENT_LOADED);
        currentSocket.off(SOCKET_EVENTS.DOCUMENT_UPDATE);
        currentSocket.off(SOCKET_EVENTS.DOCUMENT_SAVED);
        currentSocket.off(SOCKET_EVENTS.PRESENCE_LIST);
        currentSocket.off(SOCKET_EVENTS.USER_JOINED);
        currentSocket.off(SOCKET_EVENTS.USER_LEFT);
        currentSocket.off(SOCKET_EVENTS.USER_TYPING);
      }
    };
  }, [documentId, isConnected]);

  const autosaveTimeoutRef = useRef(null);

  // ─── Emit text changes + typing indicator ──────────────
  const updateContent = useCallback((newContent) => {
    setDocument((prev) => (prev ? { ...prev, content: newContent } : null));
    setIsSaving(true);

    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.DOCUMENT_CHANGE, {
        documentId,
        content: newContent,
      });

      // Typing indicator: send "typing" then auto-stop after 1.5s
      socketRef.current.emit(SOCKET_EVENTS.TYPING, { documentId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && isConnected) {
          socketRef.current.emit(SOCKET_EVENTS.TYPING, { documentId, isTyping: false });
        }
      }, 1500);
    } else {
      // Fallback: Debounced REST API auto-save if socket disconnected
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          await docApi.updateDocument(documentId, { content: newContent });
          setIsSaving(false);
        } catch (err) {
          console.error('REST auto-save failed:', err);
          setIsSaving(false);
        }
      }, 2000);
    }
  }, [documentId, isConnected]);

  // ─── Debounced title update ────────────────────────────
  const updateTitleTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (updateTitleTimeoutRef.current) clearTimeout(updateTitleTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, []);

  const updateTitle = useCallback((newTitle) => {
    setDocument((prev) => (prev ? { ...prev, title: newTitle } : null));

    if (updateTitleTimeoutRef.current) clearTimeout(updateTitleTimeoutRef.current);

    updateTitleTimeoutRef.current = setTimeout(async () => {
      try {
        await docApi.updateDocument(documentId, { title: newTitle });
      } catch (err) {
        toast.error('Failed to rename document');
      }
    }, 1000);
  }, [documentId]);

  // ─── Manual save trigger ───────────────────────────────
  const saveDocument = useCallback(async () => {
    if (!document) return;
    setIsSaving(true);
    if (socketRef.current && isConnected) {
      socketRef.current.emit(SOCKET_EVENTS.SAVE_DOCUMENT, {
        documentId,
        content: document.content,
      });
    } else {
      // Fallback: Manual Save via REST API
      try {
        await docApi.updateDocument(documentId, { content: document.content });
        toast.success('Document saved successfully');
      } catch (err) {
        toast.error('Failed to save document');
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [documentId, isConnected, document]);

  return {
    document,
    isLoading,
    isSaving,
    activeUsers,
    typingUsers,
    updateContent,
    updateTitle,
    saveDocument,
  };
}
