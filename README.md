# Y-Ultimate Management Platform

A comprehensive dual-purpose management system for Ultimate Frisbee tournaments and coaching programmes, built with modern web technologies.

## Overview

The Y-Ultimate Management Platform provides two distinct but integrated solutions:

- **Tournament Platform**: Complete tournament lifecycle management with live scoring, team registration, and spirit scoring
- **Coaching Platform**: Youth development programme management with child profiles, session tracking, and assessment systems

## Architecture

This project consists of two main components:

### Backend (Node.js/Express)
- RESTful API with 50+ endpoints
- Real-time features with Socket.io
- MongoDB database with Redis caching
- JWT authentication with role-based access control
- File upload integration with Cloudinary
- Background job processing with Bull Queue

### Frontend (Next.js 14/React)
- Modern React application with App Router
- Real-time UI updates via Socket.io
- Responsive design with Tailwind CSS
- Role-based navigation and permissions
- Beautiful animations with Framer Motion

## Quick Start

### Prerequisites
- Node.js (v16+ for backend, v18+ for frontend)
- MongoDB (v5.0+)
- Redis (v6.0+)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/yultimate-app.git
   cd yultimate-app
   ```

2. **Backend Setup**
   
   For detailed backend setup instructions, see: **[backend/README.md](./backend/README.md)**
   
   Quick start:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   
   For detailed frontend setup instructions, see: **[frontend/README.md](./frontend/README.md)**
   
   Quick start:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your configuration
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Features

### Tournament Management
- Tournament creation and management
- Team registration with approval workflow
- Live match scoring with real-time updates
- Spirit scoring system (Ultimate Frisbee's unique sportsmanship feature)
- Comprehensive reporting and analytics

### Coaching Programme Management
- Centralized child profile management
- Session scheduling and attendance tracking
- Home visit management for community outreach
- LSAS (Life Skills Assessment System)
- Programme insights and analytics

### Real-time Features
- Live scoring updates
- Real-time attendance marking
- Instant notifications
- Tournament leaderboards

## User Roles

The platform supports 12 different user roles with specific permissions:

**Tournament Roles**: Tournament Director, Team Manager, Player, Volunteer, Scoring Team
**Coaching Roles**: Programme Director, Programme Manager, Coach, Coordinator
**General Roles**: Sponsor, Spectator, Reporting Team

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB, Redis, Socket.io
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion
- **Authentication**: JWT with role-based access control
- **Real-time**: Socket.io for live updates
- **File Storage**: Cloudinary integration
- **Background Jobs**: Bull Queue with Redis

## Documentation

- **Backend Setup**: [backend/README.md](./backend/README.md)
- **Frontend Setup**: [frontend/README.md](./frontend/README.md)
- **API Documentation**: Available in backend README
- **Deployment Guide**: Available in both component READMEs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Follow the setup instructions in the respective README files
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For setup issues or questions:
- Check the detailed README files in `backend/` and `frontend/` folders
- Review the troubleshooting sections in component READMEs
- Open an issue on GitHub

---

**Note**: This is the main project README. For detailed implementation instructions, please refer to the separate README files in the `backend/` and `frontend/` folders.