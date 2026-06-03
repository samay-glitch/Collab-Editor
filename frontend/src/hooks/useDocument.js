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
  const typingTimeoutRef = useRef(null);

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
    if (!socket || !isConnected || !documentId) return;

    // Join the document room
    socket.emit(SOCKET_EVENTS.JOIN_DOCUMENT, { documentId });

    // Server loaded the document
    socket.on(SOCKET_EVENTS.DOCUMENT_LOADED, (loadedDoc) => {
      setDocument(loadedDoc);
    });

    // Another user changed the document content
    socket.on(SOCKET_EVENTS.DOCUMENT_UPDATE, ({ content }) => {
      setDocument((prev) => (prev ? { ...prev, content } : null));
    });

    // Document was auto-saved to DB
    socket.on(SOCKET_EVENTS.DOCUMENT_SAVED, () => {
      setIsSaving(false);
    });

    // Full list of currently active users
    socket.on(SOCKET_EVENTS.PRESENCE_LIST, (users) => {
      setActiveUsers(users);
    });

    // A user joined the document room
    socket.on(SOCKET_EVENTS.USER_JOINED, ({ userId, userName, avatar }) => {
      setActiveUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, userName, avatar }];
      });
      toast.success(`${userName} joined`, { duration: 2000, icon: '👋' });
    });

    // A user left the document room
    socket.on(SOCKET_EVENTS.USER_LEFT, ({ userId, userName }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
      if (userName) {
        toast(`${userName} left`, { duration: 2000, icon: '🚪' });
      }
    });

    // Typing indicator from another user
    socket.on(SOCKET_EVENTS.USER_TYPING, ({ userId, userName, isTyping }) => {
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
      socket.emit(SOCKET_EVENTS.LEAVE_DOCUMENT, { documentId });
      socket.off(SOCKET_EVENTS.DOCUMENT_LOADED);
      socket.off(SOCKET_EVENTS.DOCUMENT_UPDATE);
      socket.off(SOCKET_EVENTS.DOCUMENT_SAVED);
      socket.off(SOCKET_EVENTS.PRESENCE_LIST);
      socket.off(SOCKET_EVENTS.USER_JOINED);
      socket.off(SOCKET_EVENTS.USER_LEFT);
      socket.off(SOCKET_EVENTS.USER_TYPING);
    };
  }, [documentId, isConnected, socket]);

  const autosaveTimeoutRef = useRef(null);

  // ─── Emit text changes + typing indicator ──────────────
  const updateContent = useCallback((newContent) => {
    setDocument((prev) => (prev ? { ...prev, content: newContent } : null));
    setIsSaving(true);

    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.DOCUMENT_CHANGE, {
        documentId,
        content: newContent,
      });

      // Typing indicator: send "typing" then auto-stop after 1.5s
      socket.emit(SOCKET_EVENTS.TYPING, { documentId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && isConnected) {
          socket.emit(SOCKET_EVENTS.TYPING, { documentId, isTyping: false });
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
  }, [documentId, isConnected, socket]);

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
    if (socket && isConnected) {
      socket.emit(SOCKET_EVENTS.SAVE_DOCUMENT, {
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
  }, [documentId, isConnected, document, socket]);

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
