# Y-Ultimate Management Platform - Frontend

A modern, responsive frontend application for managing Ultimate Frisbee tournaments and coaching programmes, built with Next.js 14, React, and Tailwind CSS.

## Features

### Tournament Management
- Tournament creation and management interface
- Team registration with approval workflow
- Match scheduling and live scoring
- Spirit scoring system
- Real-time updates via Socket.io
- Comprehensive reporting and analytics

### Coaching Programme Management
- Child profile management
- Session scheduling and attendance tracking
- Home visit management
- Assessment system (LSAS)
- Coach workload monitoring
- Automated reporting

### User Experience
- Beautiful, colorful UI with animations
- Role-based navigation and access control
- Real-time notifications
- Responsive design for all devices
- Dark mode support
- Accessibility compliant

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)
- **Real-time**: Socket.io Client
- **Icons**: Lucide React
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/downloads)
- **Backend API** - Make sure the Y-Ultimate backend is running on `http://localhost:5000`

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/yultimate-frontend.git
cd yultimate-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Edit the `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 4. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

### 5. Open Your Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Complete Setup Guide

### Step-by-Step Installation

1. **Verify Node.js Installation**
   ```bash
   node --version  # Should be v18 or higher
   npm --version   # Should be v8 or higher
   ```

2. **Clone and Navigate**
   ```bash
   git clone https://github.com/your-username/yultimate-frontend.git
   cd yultimate-frontend
   ```

3. **Install All Dependencies**
   ```bash
   npm install
   ```
   This will install:
   - Next.js 14
   - React 18
   - Tailwind CSS
   - Framer Motion
   - Socket.io Client
   - React Query
   - And all other dependencies

4. **Environment Configuration**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit with your settings
   nano .env.local  # or use your preferred editor
   ```

5. **Verify Backend Connection**
   Make sure your backend is running on `http://localhost:5000`
   ```bash
   curl http://localhost:5000/api/health
   # Should return backend status
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   
7. **Access the Application**
   - Open browser to `http://localhost:3000`
   - You should see the platform selection page
   - Choose between Tournament or Coaching platform

### First Time Setup

1. **Create Admin Account**
   - Go to registration page
   - Create account with admin role
   - Or use seeded admin account from backend

2. **Test Platform Features**
   - **Tournament Platform**: Create a tournament, register teams
   - **Coaching Platform**: Add children, create sessions

### Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, start backend
cd ../backend
npm run dev

# Optional: Start database services
# MongoDB and Redis (see backend README)
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint checks
npm run lint:fix     # Fix ESLint issues automatically

# Testing (if tests are added)
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Analysis
npm run analyze      # Analyze bundle size
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   # or use different port
   npm run dev -- -p 3001
   ```

2. **API Connection Failed**
   - Verify backend is running on port 5000
   - Check `.env.local` has correct API URL
   - Ensure no CORS issues

3. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Environment Issues

- **Missing Environment Variables**: Check `.env.local` exists and has required variables
- **API URL Wrong**: Ensure `NEXT_PUBLIC_API_URL` matches your backend URL
- **Socket Connection**: Verify `NEXT_PUBLIC_SOCKET_URL` is correct

### Performance Issues

- **Slow Development**: Try clearing Next.js cache with `rm -rf .next`
- **Memory Issues**: Increase Node.js memory with `NODE_OPTIONS="--max-old-space-size=4096" npm run dev`

## Environment Variables

Create `.env.local` file with these variables:

```env
# Required - API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Optional - Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Optional - Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Environment Variable Descriptions

- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server URL (usually same as API)
- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry error tracking DSN
- `NEXT_PUBLIC_ENABLE_*`: Feature flags for optional features

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard layout and pages
│   ├── tournaments/       # Tournament management
│   ├── teams/            # Team management
│   ├── matches/          # Match management
│   ├── children/         # Child management
│   ├── sessions/         # Session management
│   ├── reports/          # Reports and analytics
│   └── profile/          # User profile
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── lib/                 # Core libraries and contexts
│   ├── auth-context.js  # Authentication context
│   ├── socket-context.js # Socket.io context
│   └── api.js           # API client
├── hooks/               # Custom React hooks
├── utils/               # Utility functions and constants
└── styles/              # Global styles and Tailwind config
```

## Key Components

### Authentication System
- JWT-based authentication with refresh tokens
- Role-based access control (12 user roles)
- Automatic token refresh and logout
- Protected routes and navigation

### Real-time Features
- Live match scoring updates
- Real-time attendance marking
- Spirit score submissions
- Tournament leaderboards
- Session status updates

### UI Components
- **Button**: Multiple variants with animations
- **Card**: Glass morphism design with hover effects
- **Input**: Form inputs with validation states
- **Modal**: Animated modals with backdrop
- **Badge**: Status indicators with color coding
- **Table**: Data tables with sorting and pagination
- **LoadingSpinner**: Beautiful loading states

### Feature Components
- **TournamentCard**: Tournament display with status
- **MatchCard**: Live match scoring interface
- **StatsCard**: Dashboard metrics with trends
- **QuickActions**: Role-based action shortcuts
- **RecentActivity**: Activity feed with real-time updates

## User Roles & Permissions

### Tournament Roles
- **Tournament Director**: Full tournament management
- **Team Manager**: Team registration and management
- **Player**: View tournaments and matches
- **Volunteer**: Assist with tournament operations
- **Scoring Team**: Live match scoring

### Coaching Roles
- **Programme Director**: Full programme oversight
- **Programme Manager**: Programme operations
- **Coach**: Session management and attendance
- **Coordinator**: Administrative support

### General Roles
- **Sponsor**: View tournaments and branding
- **Spectator**: View public tournament information
- **Reporting Team**: Access to reports and analytics

## API Integration

The frontend integrates with the Y-Ultimate backend API:

- **Authentication**: Login, register, profile management
- **Tournaments**: CRUD operations, team registration
- **Matches**: Scheduling, scoring, attendance
- **Children**: Registration, profiles, transfers
- **Sessions**: Creation, attendance, management
- **Reports**: Analytics, data export

## Real-time Events

Socket.io integration for live updates:

### Tournament Events
- `join-tournament`: Join tournament room
- `join-match`: Join match room for scoring
- `score-update`: Send score updates
- `match-score-updated`: Receive score updates
- `spirit-score-updated`: Spirit score changes

### Coaching Events
- `join-session`: Join session room
- `attendance-update`: Send attendance updates
- `attendance-updated`: Receive attendance changes

## Styling & Design

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1D4ED8)
- **Secondary**: Purple gradient (#8B5CF6 to #7C3AED)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Design Features
- Glass morphism effects
- Gradient backgrounds
- Smooth animations with Framer Motion
- Custom scrollbars
- Responsive grid layouts
- Hover effects and micro-interactions

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Code Style
- ESLint configuration for React and Next.js
- Prettier for code formatting
- Consistent component structure
- TypeScript-ready (can be migrated)

## Deployment

### Production Build

Before deploying, create a production build:

```bash
# Build the application
npm run build

# Test production build locally
npm run start
```

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   # First time deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

3. **Environment Variables**
   - Add environment variables in Vercel dashboard
   - Or use `vercel env` command

### Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add in Netlify dashboard under Site Settings > Environment Variables

### Docker Deployment

1. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   # Build image
   docker build -t yultimate-frontend .
   
   # Run container
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://your-api.com yultimate-frontend
   ```

### AWS Deployment

1. **S3 + CloudFront**
   ```bash
   # Export static files
   npm run build
   npm run export
   
   # Upload to S3
   aws s3 sync out/ s3://your-bucket-name
   ```

2. **Elastic Beanstalk**
   - Zip the project
   - Upload to Elastic Beanstalk
   - Set environment variables

### Production Environment Variables

```env
# Production API URLs
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend-api.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Post-Deployment Checklist

- [ ] Verify API connection works
- [ ] Test user authentication
- [ ] Check real-time features (Socket.io)
- [ ] Verify file uploads work
- [ ] Test responsive design on mobile
- [ ] Check error monitoring is active
- [ ] Verify analytics tracking
- [ ] Test all user roles and permissions

## Performance Optimizations

- Next.js 14 App Router for optimal performance
- React Query for efficient data fetching and caching
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Service worker for offline functionality
- Bundle analysis and optimization

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.