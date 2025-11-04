const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const coachingAuthRoutes = require('./routes/coachingAuth');
const platformRoutes = require('./routes/platform');
const tournamentRoutes = require('./routes/tournaments');
const teamRoutes = require('./routes/teams');
const matchRoutes = require('./routes/matches');
const spiritRoutes = require('./routes/spirit');
const childrenRoutes = require('./routes/children');
const sessionRoutes = require('./routes/sessions');
const homeVisitRoutes = require('./routes/homeVisits');
const assessmentRoutes = require('./routes/assessments');
const programRoutes = require('./routes/programs');
const coachRoutes = require('./routes/coaches');
const reportRoutes = require('./routes/reports');
const scheduleRoutes = require('./routes/schedule');
const updateRoutes = require('./routes/updates');
const mediaRoutes = require('./routes/media');
const socialMediaRoutes = require('./routes/socialMedia');
const followRoutes = require('./routes/follow');
const predictionRoutes = require('./routes/predictions');
const pollRoutes = require('./routes/polls');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time features
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  skip: (req) => {
    // Skip rate limiting for auth endpoints in development
    return process.env.NODE_ENV === 'development' && req.path.includes('/auth/');
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
console.log('Registering routes...');
app.use('/api/platform', platformRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coaching/auth', coachingAuthRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
console.log('Registering spirit routes at /api/spirit-scores');
app.use('/api/spirit-scores', spiritRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/home-visits', homeVisitRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', scheduleRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/notifications', notificationRoutes);
console.log('All routes registered successfully');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Y-Ultimate Management Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join tournament room for live updates
  socket.on('join-tournament', (tournamentId) => {
    socket.join(`tournament-${tournamentId}`);
    console.log(`User ${socket.id} joined tournament ${tournamentId}`);
    
    // Send recent updates to newly joined user
    socket.emit('tournament-joined', { tournamentId });
  });

  // Join match room for live scoring
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`User ${socket.id} joined match ${matchId}`);
  });

  // Join session room for attendance updates
  socket.on('join-session', (sessionId) => {
    socket.join(`session-${sessionId}`);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  // Handle live score updates
  socket.on('score-update', (data) => {
    socket.to(`match-${data.matchId}`).emit('score-updated', data);
    socket.to(`tournament-${data.tournamentId}`).emit('match-score-updated', data);
  });

  // Handle attendance updates
  socket.on('attendance-update', (data) => {
    socket.to(`session-${data.sessionId}`).emit('attendance-updated', data);
  });

  // Handle spirit score submissions
  socket.on('spirit-score-submitted', (data) => {
    socket.to(`tournament-${data.tournamentId}`).emit('spirit-score-updated', data);
  });

  // Handle live updates
  socket.on('new-announcement', (data) => {
    socket.to(`tournament-${data.tournamentId}`).emit('new-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Y-Ultimate Management Platform server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server, io };