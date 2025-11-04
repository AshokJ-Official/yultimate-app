const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Tournament specific authorization
exports.authorizeTournament = (...roles) => {
  return (req, res, next) => {
    const tournamentRoles = ['tournament_director', 'team_manager', 'volunteer', 'scoring_team'];
    const userRole = req.user.role;
    
    // If specific roles are provided, check those first
    if (roles.length > 0) {
      if (roles.includes(userRole)) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this tournament action'
      });
    }
    
    // If no specific roles, check general tournament roles
    if (tournamentRoles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Not authorized for tournament operations'
    });
  };
};

// Coaching programme specific authorization
exports.authorizeCoaching = (...roles) => {
  return (req, res, next) => {
    const coachingRoles = ['programme_director', 'programme_manager', 'coach', 'data_team', 'coordinator'];
    const userRole = req.user.role;
    
    console.log('Authorization check:', {
      userRole,
      requiredRoles: roles,
      allCoachingRoles: coachingRoles
    });
    
    // If specific roles are provided, check those first
    if (roles.length > 0) {
      if (roles.includes(userRole)) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: `Not authorized for this coaching action. User role: ${userRole}, Required: ${roles.join(', ')}`
      });
    }
    
    // If no specific roles, check general coaching roles
    if (coachingRoles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: `Not authorized for coaching operations. User role: ${userRole}, Allowed: ${coachingRoles.join(', ')}`
    });
  };
};