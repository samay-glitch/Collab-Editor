export const SOCKET_EVENTS = {
  // Client -> Server Events
  JOIN_DOCUMENT: 'join-document',
  LEAVE_DOCUMENT: 'leave-document',
  DOCUMENT_CHANGE: 'text-change',
  CURSOR_MOVE: 'cursor-move',
  TYPING: 'typing',
  SAVE_DOCUMENT: 'save-document',

  // Server -> Client Events
  DOCUMENT_UPDATE: 'document-updated',
  CURSOR_UPDATE: 'cursor-updated',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  USER_TYPING: 'user-typing',

  // Database Sync / Metadata Events
  DOCUMENT_LOADED: 'document-loaded',
  PRESENCE_LIST: 'presence-list',
  DOCUMENT_SAVED: 'document-saved',

  // Connection & Lifecycle
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  AUTH_ERROR: 'auth:error',
  ERROR: 'error',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  EDITOR: '/editor/:id',
};

export const APP_NAME = 'CollabEdit';
