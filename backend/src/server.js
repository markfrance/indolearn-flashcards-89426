const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown
async function shutdown() {
  // eslint-disable-next-line no-console
  console.log('Shutting down HTTP server...');
  await new Promise((resolve) => server.close(resolve));
  // eslint-disable-next-line no-console
  console.log('Closing DB pool...');
  await db.close();
  // eslint-disable-next-line no-console
  console.log('Shutdown complete.');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = server;
