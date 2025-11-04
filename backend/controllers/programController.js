const Program = require('../models/Program');

// @desc    Create program
// @route   POST /api/programs
// @access  Private (Programme Director, Programme Manager)
exports.createProgram = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const program = await Program.create(req.body);

    await program.populate('createdBy staff.coordinator staff.coaches staff.volunteers', 'name email');

    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Program creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all programs
// @route   GET /api/programs
// @access  Private
exports.getPrograms = async (req, res) => {
  try {
    const { type, status, location, page = 1, limit = 20 } = req.query;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (location) query['location.name'] = new RegExp(location, 'i');

    const programs = await Program.find(query)
      .populate('createdBy staff.coordinator staff.coaches', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Program.countDocuments(query);

    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single program
// @route   GET /api/programs/:id
// @access  Private
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate('createdBy staff.coordinator staff.coaches staff.volunteers', 'name email phone');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
// @access  Private (Programme Director, Programme Manager)
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('createdBy staff.coordinator staff.coaches', 'name email');

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.status(200).json({
      success: true,
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
// @access  Private (Programme Director)
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    await program.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};