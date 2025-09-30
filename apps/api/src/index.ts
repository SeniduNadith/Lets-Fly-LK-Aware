import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import policyRoutes from './routes/policies';
import quizRoutes from './routes/quizzes';
import reportRoutes from './routes/reports';
import factRoutes from './routes/facts';
import gameRoutes from './routes/games';
import trainingRoutes from './routes/training';
import profileRoutes from './routes/profile';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './config/logger';
import './middleware/auth'; // Import to get the Request type extension

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Disable or relax rate limiting in development to avoid 429s during local testing
if (isProduction) {
  app.use('/api/', limiter);
} else {
  // In development, apply a very relaxed limiter (or comment this line to disable completely)
  const devLimiter = rateLimit({ windowMs: 60 * 1000, max: 1000 });
  app.use('/api/', devLimiter);
}

// In development, provide a mock auth context so unauthenticated requests don't 401 during UI dev
if (!isProduction) {
  app.use((req, _res, next) => {
    // Always set demo user in development mode
    req.user = {
      id: 1,
      username: 'demo',
      email: 'demo@dynamicbiz.com',
      department: 'IT'
    };
    next();
  });
}

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'DynamicBiz Security Awareness API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/facts', factRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/profile', profileRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join role-based room
  socket.on('join-role', (role: string) => {
    socket.join(`role-${role}`);
    logger.info(`User ${socket.id} joined role room: ${role}`);
  });

  // Handle quiz submissions
  socket.on('quiz-submitted', (data) => {
    socket.broadcast.to(`role-${data.role}`).emit('quiz-update', data);
  });

  // Handle game completions
  socket.on('game-completed', (data) => {
    socket.broadcast.to(`role-${data.role}`).emit('game-update', data);
  });

  // Handle policy acknowledgments
  socket.on('policy-acknowledged', (data) => {
    socket.broadcast.emit('policy-update', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 DynamicBiz Security Awareness API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Security features: Helmet, CORS, Rate Limiting enabled`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { app, io };
