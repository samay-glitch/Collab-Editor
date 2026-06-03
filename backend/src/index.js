const http = require('http');
const app = require('./app');
const { PORT } = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');
const logger = require('./utils/logger');

const server = http.createServer(app);

connectDB();
initSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
});
