const { CLIENT_URL } = require('./env');

const origin = CLIENT_URL ? (CLIENT_URL.endsWith('/') ? CLIENT_URL.slice(0, -1) : CLIENT_URL) : '*';

const corsOptions = {
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
