const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { AppError } = require('./utils/errors');
const healthRoutes = require('./routes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const flashcardRoutes = require('./routes/flashcards');
const categoryRoutes = require('./routes/categories');
const quizRoutes = require('./routes/quizzes');
const statsRoutes = require('./routes/stats');

// Initialize express app
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');           // may or may not include port
  let protocol = req.protocol;          // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  
  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Mount routes
app.use('/', healthRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/flashcards', flashcardRoutes);
app.use('/categories', categoryRoutes);
app.use('/quizzes', quizRoutes);
app.use('/stats', statsRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err.stack || err);
  if (err instanceof AppError || err.statusCode) {
    const status = err.statusCode || 500;
    return res.status(status).json({
      status: 'error',
      message: err.message,
      details: err.details,
    });
  }
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

module.exports = app;
