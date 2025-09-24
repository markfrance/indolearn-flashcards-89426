require('dotenv').config(); // Load .env before any env access
const app = require('./app');
const config = require('./config/env'); // Triggers early validation/warnings for Supabase keys

const PORT = config.app.port;
const HOST = config.app.host;

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://${HOST}:${PORT}`);
});

// Graceful shutdown without database pool (Supabase uses HTTP)
async function shutdown() {
  // eslint-disable-next-line no-console
  console.log('Shutting down HTTP server...');
  await new Promise((resolve) => server.close(resolve));
  // eslint-disable-next-line no-console
  console.log('Shutdown complete.');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = server;
