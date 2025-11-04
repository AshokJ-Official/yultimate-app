// Role-based access levels
const ROLE_PERMISSIONS = {
  tournament_director: {
    level: 'full_admin',
    description: 'Full control over tournaments, teams, schedules, and reporting',
    permissions: ['read', 'write', 'delete', 'admin']
  },
  team_manager: {
    level: 'team_access',
    description: 'Manages team registration, rosters, and spirit score submissions',
    permissions: ['read', 'write_team']
  },
  player: {
    level: 'read_limited',
    description: 'Views schedules, results, and spirit scores for personal and team tracking',
    permissions: ['read_limited']
  },
  volunteer: {
    level: 'field_access',
    description: 'Inputs live match scores and marks attendance on the field',
    permissions: ['read', 'write_field']
  },
  scoring_team: {
    level: 'sub_admin',
    description: 'Validates data and ensures accurate publication of results',
    permissions: ['read', 'write', 'validate']
  },
  sponsor: {
    level: 'read_public',
    description: 'Accesses branded dashboards and analytics for engagement visibility',
    permissions: ['read_public']
  },
  spectator: {
    level: 'public_access',
    description: 'Follows teams, checks live scores, and engages with polls or predictions',
    permissions: ['read_public', 'engage']
  }
};

// Check if user has specific permission
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    if (!rolePermissions) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }
    
    if (rolePermissions.permissions.includes(permission) || rolePermissions.permissions.includes('admin')) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: `Access denied. Required permission: ${permission}`
    });
  };
};

// Check access level
exports.requireAccessLevel = (level) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    if (!rolePermissions) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role'
      });
    }
    
    const accessLevels = {
      'public_access': 1,
      'read_public': 2,
      'read_limited': 3,
      'field_access': 4,
      'team_access': 5,
      'sub_admin': 6,
      'full_admin': 7
    };
    
    const userLevel = accessLevels[rolePermissions.level] || 0;
    const requiredLevel = accessLevels[level] || 0;
    
    if (userLevel >= requiredLevel) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: `Insufficient access level. Required: ${level}`
    });
  };
};

// Tournament-specific role authorization
exports.authorizeTournamentRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Not authorized for this tournament operation'
    });
  };
};

// Public access (no authentication required)
exports.publicAccess = (req, res, next) => {
  next();
};

// Read-only access for public roles
exports.publicReadAccess = (req, res, next) => {
  if (!req.user) {
    return next();
  }
  
  const publicRoles = ['spectator', 'sponsor'];
  if (publicRoles.includes(req.user.role) || ROLE_PERMISSIONS[req.user.role]?.permissions.includes('admin')) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
};

module.exports = { ROLE_PERMISSIONS };