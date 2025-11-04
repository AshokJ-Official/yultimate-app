const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register coaching platform user
// @route   POST /api/coaching/auth/register
// @access  Public
exports.registerCoaching = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate coaching platform roles
    const coachingRoles = ['programme_director', 'programme_manager', 'coach', 'data_team', 'coordinator'];
    if (!coachingRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for coaching platform'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user with platform identifier
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      platform: 'coaching'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      platform: 'coaching',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        platform: user.platform
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login coaching platform user
// @route   POST /api/coaching/auth/login
// @access  Public
exports.loginCoaching = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user with coaching platform access
    const user = await User.findOne({ 
      email,
      $or: [
        { platform: 'coaching' },
        { role: { $in: ['programme_director', 'programme_manager', 'coach', 'data_team', 'coordinator'] } }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or no access to coaching platform'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update platform if not set
    if (!user.platform) {
      user.platform = 'coaching';
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      platform: 'coaching',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        platform: user.platform,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};