"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const policies_1 = __importDefault(require("./routes/policies"));
const quizzes_1 = __importDefault(require("./routes/quizzes"));
const reports_1 = __importDefault(require("./routes/reports"));
const facts_1 = __importDefault(require("./routes/facts"));
const games_1 = __importDefault(require("./routes/games"));
const training_1 = __importDefault(require("./routes/training"));
const profile_1 = __importDefault(require("./routes/profile"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./config/logger");
require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const PORT = process.env.PORT || 3001;
const isProduction = (process.env.NODE_ENV || 'development') === 'production';
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
if (isProduction) {
    app.use('/api/', limiter);
}
else {
    const devLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 1000, max: 1000 });
    app.use('/api/', devLimiter);
}
if (!isProduction) {
    app.use((req, _res, next) => {
        req.user = {
            id: 1,
            username: 'demo',
            email: 'demo@dynamicbiz.com',
            department: 'IT'
        };
        next();
    });
}
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'DynamicBiz Security Awareness API'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/policies', policies_1.default);
app.use('/api/quizzes', quizzes_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/facts', facts_1.default);
app.use('/api/games', games_1.default);
app.use('/api/training', training_1.default);
app.use('/api/profile', profile_1.default);
io.on('connection', (socket) => {
    logger_1.logger.info(`User connected: ${socket.id}`);
    socket.on('join-role', (role) => {
        socket.join(`role-${role}`);
        logger_1.logger.info(`User ${socket.id} joined role room: ${role}`);
    });
    socket.on('quiz-submitted', (data) => {
        socket.broadcast.to(`role-${data.role}`).emit('quiz-update', data);
    });
    socket.on('game-completed', (data) => {
        socket.broadcast.to(`role-${data.role}`).emit('game-update', data);
    });
    socket.on('policy-acknowledged', (data) => {
        socket.broadcast.emit('policy-update', data);
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`User disconnected: ${socket.id}`);
    });
});
app.use(errorHandler_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
server.listen(PORT, () => {
    logger_1.logger.info(`🚀 DynamicBiz Security Awareness API server running on port ${PORT}`);
    logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.logger.info(`🔒 Security features: Helmet, CORS, Rate Limiting enabled`);
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map