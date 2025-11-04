const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
exports.validateUserRegistration = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn([
    'tournament_director', 'team_manager', 'player', 'volunteer', 'scoring_team',
    'sponsor', 'spectator', 'programme_director', 'programme_manager', 'coach',
    'reporting_team', 'coordinator'
  ]).withMessage('Please provide a valid role')
];

// Tournament validation rules
exports.validateTournament = [
  body('title').trim().isLength({ min: 3 }).withMessage('Tournament title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('startDate').isISO8601().withMessage('Please provide a valid start date'),
  body('endDate').isISO8601().withMessage('Please provide a valid end date'),
  body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
  body('maxTeams').optional().isInt({ min: 2 }).withMessage('Max teams must be at least 2'),
  body('registrationDeadline').optional().isISO8601().withMessage('Please provide a valid registration deadline')
];

// Team validation rules
exports.validateTeam = [
  body('name').trim().isLength({ min: 2 }).withMessage('Team name must be at least 2 characters'),
  body('tournament').isMongoId().withMessage('Please provide a valid tournament ID')
];

// Child validation rules
exports.validateChild = [
  body('name').trim().isLength({ min: 2 }).withMessage('Child name must be at least 2 characters'),
  body('age').isInt({ min: 5, max: 18 }).withMessage('Age must be between 5 and 18'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Please provide a valid gender'),
  body('guardianName').trim().isLength({ min: 2 }).withMessage('Guardian name must be at least 2 characters'),
  body('guardianPhone').isMobilePhone().withMessage('Please provide a valid phone number')
];

// Session validation rules
exports.validateSession = [
  body('title').trim().isLength({ min: 3 }).withMessage('Session title must be at least 3 characters'),
  body('type').isIn(['school', 'community', 'workshop']).withMessage('Please provide a valid session type'),
  body('scheduledDate').isISO8601().withMessage('Please provide a valid scheduled date'),
  body('scheduledStartTime').isISO8601().withMessage('Please provide a valid start time'),
  body('scheduledEndTime').isISO8601().withMessage('Please provide a valid end time')
];