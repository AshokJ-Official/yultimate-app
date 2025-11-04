# Y-Ultimate Management Platform - Backend

A comprehensive backend system for managing Ultimate Frisbee tournaments and coaching programmes, built with Node.js, Express, MongoDB, and Socket.io.

## Features

### Tournament Management
- Tournament creation and management
- Team registration with approval workflow
- Player management and roster tracking
- Match scheduling (Round-robin, Bracket, Swiss)
- Live scoring and real-time updates
- Spirit scoring system (5 categories, 0-4 scale)
- Attendance tracking
- Photo uploads and galleries
- Comprehensive reporting and analytics

### Coaching Programme Management
- Centralized child profiles with transfer tracking
- Session management with real-time attendance
- Home visit tracking and management
- LSAS (Life Skills Assessment) system
- Coach workload monitoring
- Automated reporting and analytics
- Bulk data import/export

### Real-time Features
- Live match scoring updates
- Real-time attendance marking
- Spirit score submissions
- Tournament leaderboards
- Session status updates

### User Management
- Role-based access control
- JWT authentication
- Multiple user types:
  - Tournament Director, Team Manager, Player, Volunteer, Scoring Team
  - Programme Director, Programme Manager, Coach, Coordinator
  - Sponsor, Spectator, Reporting Team

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT with Passport.js
- **Caching**: Redis
- **Background Jobs**: Bull Queue
- **Email**: Nodemailer
- **File Upload**: Multer with Cloudinary
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Redis** (v6.0 or higher) - [Download here](https://redis.io/download)
- **Git** - [Download here](https://git-scm.com/downloads)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/yultimate-backend.git
cd yultimate-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yultimate
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary Configuration (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Start Required Services

#### MongoDB
```bash
# Windows (if installed as service)
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux (using systemd)
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/your/db
```

#### Redis
```bash
# Windows (if installed as service)
net start Redis

# macOS (using Homebrew)
brew services start redis

# Linux (using systemd)
sudo systemctl start redis

# Or run manually
redis-server
```

### 5. Initialize Database (Optional)
Create initial admin user and sample data:
```bash
npm run seed
```

### 6. Start the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Detailed Setup Guide

### MongoDB Setup

1. **Install MongoDB Community Edition**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for your OS

2. **Create Database Directory** (if running manually)
   ```bash
   mkdir -p /data/db  # macOS/Linux
   # or
   mkdir C:\data\db   # Windows
   ```

3. **Start MongoDB**
   ```bash
   mongod --dbpath /data/db
   ```

4. **Verify Installation**
   ```bash
   mongo
   # Should connect to MongoDB shell
   ```

### Redis Setup

1. **Install Redis**
   ```bash
   # macOS
   brew install redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # Windows - Download from https://redis.io/download
   ```

2. **Start Redis**
   ```bash
   redis-server
   ```

3. **Verify Installation**
   ```bash
   redis-cli ping
   # Should return PONG
   ```

### Cloudinary Setup (for file uploads)

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your credentials from the dashboard
3. Add to `.env` file

### Email Setup (for notifications)

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate app password
   - Use app password in `EMAIL_PASS`

2. **Other Email Providers**:
   - Update `EMAIL_HOST` and `EMAIL_PORT`
   - Use appropriate credentials

## Development Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Seed database with sample data
npm run seed

# Clear database
npm run db:clear
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   # Find and kill process using port 5000
   lsof -ti:5000 | xargs kill -9  # macOS/Linux
   netstat -ano | findstr :5000   # Windows
   
   # Or change port in .env
   PORT=5001
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   mongo --eval "db.adminCommand('ismaster')"
   
   # Start MongoDB service
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   net start MongoDB  # Windows
   ```

3. **Redis Connection Failed**
   ```bash
   # Check if Redis is running
   redis-cli ping
   
   # Start Redis service
   sudo systemctl start redis  # Linux
   brew services start redis  # macOS
   redis-server  # Manual start
   ```

4. **JWT Secret Missing**
   - Ensure `JWT_SECRET` is set in `.env`
   - Use a long, random string (at least 32 characters)

5. **Cloudinary Upload Errors**
   - Verify `CLOUDINARY_*` credentials in `.env`
   - Check Cloudinary dashboard for API limits

6. **Email Sending Failed**
   - Verify email credentials in `.env`
   - For Gmail, use App Password, not regular password
   - Check email provider SMTP settings

### Database Issues

1. **Clear Database**
   ```bash
   npm run db:clear
   ```

2. **Reset with Sample Data**
   ```bash
   npm run db:clear
   npm run seed
   ```

3. **MongoDB Connection String**
   ```bash
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/yultimate
   
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/yultimate
   ```

### Performance Issues

1. **Slow API Responses**
   - Check database indexes
   - Monitor MongoDB performance
   - Review API endpoint efficiency

2. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run dev
   ```

3. **Redis Memory Usage**
   ```bash
   # Check Redis memory usage
   redis-cli info memory
   
   # Clear Redis cache
   redis-cli flushall
   ```

### Development Tips

1. **API Testing**
   ```bash
   # Test API endpoints
   curl http://localhost:5000/api/health
   
   # Test with authentication
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/auth/me
   ```

2. **View Logs**
   ```bash
   # Development logs
   npm run dev
   
   # Production logs
   pm2 logs  # if using PM2
   ```

3. **Database Inspection**
   ```bash
   # Connect to MongoDB
   mongo yultimate
   
   # View collections
   show collections
   
   # Query data
   db.users.find().limit(5)
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yultimate
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/changepassword` - Change password

### Tournament Management
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create tournament
- `GET /api/tournaments/:id` - Get tournament details
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament
- `POST /api/tournaments/:id/visitors` - Register visitor

### Team Management
- `POST /api/teams` - Register team
- `GET /api/teams/tournament/:tournamentId` - Get teams by tournament
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `PUT /api/teams/:id/status` - Approve/reject team
- `POST /api/teams/:id/players` - Add player to team
- `DELETE /api/teams/:id/players/:playerId` - Remove player from team

### Match Management
- `POST /api/matches` - Create match
- `GET /api/matches/tournament/:tournamentId` - Get matches by tournament
- `GET /api/matches/:id` - Get match details
- `PUT /api/matches/:id/score` - Update match score
- `PUT /api/matches/:id/complete` - Complete match
- `PUT /api/matches/:id/attendance` - Mark attendance
- `POST /api/matches/:id/photos` - Upload match photos
- `GET /api/matches/live` - Get live matches

### Spirit Scoring
- `POST /api/spirit-scores` - Submit spirit score
- `GET /api/spirit-scores/matches/:matchId` - Get spirit scores by match
- `GET /api/spirit-scores/teams/:teamId` - Get spirit scores by team
- `GET /api/spirit-scores/tournaments/:tournamentId/leaderboard` - Get spirit leaderboard
- `GET /api/spirit-scores/teams/:teamId/pending` - Get pending spirit scores

### Child Management
- `GET /api/children` - Get all children
- `POST /api/children` - Register child
- `GET /api/children/:id` - Get child details
- `PUT /api/children/:id` - Update child
- `POST /api/children/:id/transfer` - Transfer child
- `POST /api/children/bulk-upload` - Bulk upload children
- `GET /api/children/:id/attendance` - Get child attendance

### Session Management
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `PUT /api/sessions/:id/start` - Start session
- `PUT /api/sessions/:id/complete` - Complete session
- `PUT /api/sessions/:id/attendance` - Mark attendance
- `PUT /api/sessions/:id/bulk-attendance` - Bulk mark attendance
- `POST /api/sessions/:id/photos` - Upload session photos
- `GET /api/sessions/coach-workload/:coachId` - Get coach workload

### Home Visits
- `GET /api/home-visits` - Get all home visits
- `POST /api/home-visits` - Create home visit
- `GET /api/home-visits/:id` - Get home visit details
- `PUT /api/home-visits/:id` - Update home visit
- `PUT /api/home-visits/:id/complete` - Complete home visit
- `GET /api/home-visits/children/:childId` - Get home visits by child
- `GET /api/home-visits/coaches/:coachId` - Get home visits by coach
- `GET /api/home-visits/upcoming` - Get upcoming home visits

### Assessments
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment details
- `PUT /api/assessments/:id` - Update assessment
- `PUT /api/assessments/:id/complete` - Complete assessment
- `GET /api/assessments/children/:childId` - Get assessments by child
- `GET /api/assessments/analytics` - Get assessment analytics
- `GET /api/assessments/due` - Get due assessments

### Reports
- `GET /api/reports/tournament/:tournamentId` - Get tournament report
- `GET /api/reports/tournament/:tournamentId/export` - Export tournament data
- `GET /api/reports/coaching` - Get coaching report
- `GET /api/reports/coaching/export` - Export coaching data

## Socket.io Events

### Client to Server
- `join-tournament` - Join tournament room for updates
- `join-match` - Join match room for live scoring
- `join-session` - Join session room for attendance updates
- `score-update` - Send score update
- `attendance-update` - Send attendance update
- `spirit-score-submitted` - Send spirit score submission

### Server to Client
- `score-updated` - Receive score update
- `match-score-updated` - Receive match score update for tournament
- `attendance-updated` - Receive attendance update
- `spirit-score-updated` - Receive spirit score update

## Database Models

### Tournament Models
- **Tournament**: Tournament details, fields, sponsors
- **Team**: Team information, players, stats
- **Player**: Player profiles, participation history
- **Match**: Match details, scores, attendance
- **SpiritScore**: Spirit scoring with 5 categories

### Coaching Models
- **Child**: Child profiles, programmes, transfer history
- **Session**: Coaching sessions, attendance, activities
- **HomeVisit**: Home visit records, observations, action items
- **Assessment**: LSAS assessments, progress tracking

### Common Models
- **User**: User accounts with role-based access

## Security Features

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Password hashing with bcrypt

## Background Jobs

- Email notifications
- Automated reminders
- Report generation
- Data synchronization

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

1. Set up production environment variables
2. Configure MongoDB and Redis
3. Set up email service
4. Configure Cloudinary for file uploads
5. Deploy to your preferred platform (AWS, Heroku, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.