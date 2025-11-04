const Assessment = require('../models/Assessment');
const Child = require('../models/Child');

// @desc    Create assessment
// @route   POST /api/assessments
// @access  Private (Coach, Programme Manager)
exports.createAssessment = async (req, res) => {
  try {
    console.log('Creating assessment with data:', req.body);
    req.body.assessor = req.user.id;
    
    // If child is a string (name), find or create child record
    if (typeof req.body.child === 'string' && !req.body.child.match(/^[0-9a-fA-F]{24}$/)) {
      let child = await Child.findOne({ name: req.body.child });
      if (!child) {
        // Create a basic child record if not found
        child = await Child.create({
          name: req.body.child,
          age: 10, // Default age
          gender: 'other',
          guardianName: 'Unknown',
          guardianPhone: 'Unknown',
          address: 'Unknown',
          programme: 'community',
          registeredBy: req.user.id
        });
      }
      req.body.child = child._id;
    }
    
    const assessment = await Assessment.create(req.body);

    await assessment.populate('child assessor', 'name email');

    // Update child's assessment count
    if (req.body.child) {
      await updateChildAssessmentStats(req.body.child);
    }

    res.status(201).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assessments
// @route   GET /api/assessments
// @access  Private (Coach, Programme Manager)
exports.getAssessments = async (req, res) => {
  try {
    const { 
      child, 
      assessor, 
      type, 
      programme, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    let query = {};
    
    if (child) query.child = child;
    if (assessor) query.assessor = assessor;
    if (type) query.type = type;
    if (programme) query.programme = programme;
    
    if (startDate && endDate) {
      query.assessmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If user is coach, only show their assessments
    if (req.user.role === 'coach') {
      query.assessor = req.user.id;
    }

    const assessments = await Assessment.find(query)
      .populate('child', 'name age gender programmes')
      .populate('assessor', 'name email')
      .sort({ assessmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Assessment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: assessments.length,
      total,
      data: assessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private (Coach, Programme Manager)
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('child', 'name age gender programmes school community')
      .populate('assessor', 'name email phone');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private (Coach, Programme Manager)
exports.updateAssessment = async (req, res) => {
  try {
    let assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check authorization
    if (assessment.assessor.toString() !== req.user.id && req.user.role !== 'programme_manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assessment'
      });
    }

    assessment = await Assessment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('child assessor', 'name email');

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete assessment
// @route   PUT /api/assessments/:id/complete
// @access  Private (Coach)
exports.completeAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check authorization
    if (assessment.assessor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this assessment'
      });
    }

    assessment.isCompleted = true;
    assessment.completedAt = new Date();
    await assessment.save();

    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assessments by child
// @route   GET /api/children/:childId/assessments
// @access  Private (Coach, Programme Manager)
exports.getAssessmentsByChild = async (req, res) => {
  try {
    const assessments = await Assessment.find({ child: req.params.childId })
      .populate('assessor', 'name email')
      .sort({ assessmentDate: -1 });

    // Calculate progress analytics
    const analytics = {
      totalAssessments: assessments.length,
      completedAssessments: assessments.filter(a => a.isCompleted).length,
      assessmentsByType: {},
      progressTrend: [],
      latestScores: null,
      improvement: {}
    };

    // Group by type
    assessments.forEach(assessment => {
      analytics.assessmentsByType[assessment.type] = (analytics.assessmentsByType[assessment.type] || 0) + 1;
    });

    // Calculate progress trend (chronological order)
    const chronologicalAssessments = assessments.reverse();
    analytics.progressTrend = chronologicalAssessments.map(assessment => ({
      date: assessment.assessmentDate,
      type: assessment.type,
      averageScore: assessment.averageScore,
      totalScore: assessment.totalScore
    }));

    // Get latest scores
    if (assessments.length > 0) {
      const latest = assessments[assessments.length - 1];
      analytics.latestScores = latest.lsasScores;
    }

    // Calculate improvement from baseline to latest
    const baseline = chronologicalAssessments.find(a => a.type === 'baseline');
    const latest = chronologicalAssessments[chronologicalAssessments.length - 1];

    if (baseline && latest && baseline._id.toString() !== latest._id.toString()) {
      Object.keys(baseline.lsasScores).forEach(skill => {
        const baselineScore = baseline.lsasScores[skill].score || 0;
        const latestScore = latest.lsasScores[skill].score || 0;
        analytics.improvement[skill] = {
          baseline: baselineScore,
          latest: latestScore,
          change: latestScore - baselineScore,
          percentageChange: baselineScore > 0 ? ((latestScore - baselineScore) / baselineScore * 100).toFixed(1) : 0
        };
      });
    }

    res.status(200).json({
      success: true,
      count: assessments.length,
      analytics,
      data: assessments.reverse() // Return in descending order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assessment analytics for programme
// @route   GET /api/assessments/analytics
// @access  Private (Programme Manager)
exports.getAssessmentAnalytics = async (req, res) => {
  try {
    const { programme, startDate, endDate, type } = req.query;

    let query = {};
    if (programme) query.programme = programme;
    if (type) query.type = type;
    if (startDate && endDate) {
      query.assessmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const assessments = await Assessment.find(query)
      .populate('child', 'name age gender')
      .populate('assessor', 'name');

    const analytics = {
      totalAssessments: assessments.length,
      completedAssessments: assessments.filter(a => a.isCompleted).length,
      averageScores: {
        communication: 0,
        teamwork: 0,
        leadership: 0,
        problemSolving: 0,
        selfConfidence: 0,
        emotionalRegulation: 0,
        socialSkills: 0,
        resilience: 0,
        overall: 0
      },
      assessmentsByType: {},
      assessmentsByProgramme: {},
      genderDistribution: { male: 0, female: 0, other: 0 },
      ageDistribution: {},
      topPerformers: [],
      improvementNeeded: []
    };

    if (assessments.length === 0) {
      return res.status(200).json({
        success: true,
        data: analytics
      });
    }

    // Calculate averages and distributions
    let totalScores = {
      communication: 0,
      teamwork: 0,
      leadership: 0,
      problemSolving: 0,
      selfConfidence: 0,
      emotionalRegulation: 0,
      socialSkills: 0,
      resilience: 0,
      overall: 0
    };

    assessments.forEach(assessment => {
      // Type distribution
      analytics.assessmentsByType[assessment.type] = (analytics.assessmentsByType[assessment.type] || 0) + 1;
      
      // Programme distribution
      analytics.assessmentsByProgramme[assessment.programme] = (analytics.assessmentsByProgramme[assessment.programme] || 0) + 1;
      
      // Gender distribution
      if (assessment.child.gender) {
        analytics.genderDistribution[assessment.child.gender]++;
      }
      
      // Age distribution
      const ageGroup = getAgeGroup(assessment.child.age);
      analytics.ageDistribution[ageGroup] = (analytics.ageDistribution[ageGroup] || 0) + 1;
      
      // Score accumulation
      Object.keys(assessment.lsasScores).forEach(skill => {
        if (assessment.lsasScores[skill].score) {
          totalScores[skill] += assessment.lsasScores[skill].score;
        }
      });
      totalScores.overall += assessment.averageScore;
    });

    // Calculate averages
    Object.keys(totalScores).forEach(skill => {
      analytics.averageScores[skill] = parseFloat((totalScores[skill] / assessments.length).toFixed(2));
    });

    // Identify top performers and those needing improvement
    const sortedByScore = assessments
      .filter(a => a.isCompleted)
      .sort((a, b) => b.averageScore - a.averageScore);

    analytics.topPerformers = sortedByScore.slice(0, 5).map(assessment => ({
      childName: assessment.child.name,
      averageScore: assessment.averageScore,
      assessmentDate: assessment.assessmentDate
    }));

    analytics.improvementNeeded = sortedByScore.slice(-5).reverse().map(assessment => ({
      childName: assessment.child.name,
      averageScore: assessment.averageScore,
      assessmentDate: assessment.assessmentDate,
      extraNotes: assessment.extraNotes
    }));

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get due assessments
// @route   GET /api/assessments/due
// @access  Private (Coach, Programme Manager)
exports.getDueAssessments = async (req, res) => {
  try {
    const { programme, days = 30 } = req.query;
    
    // Find children who need assessments
    let childQuery = { isActive: true };
    if (programme) {
      childQuery['programmes.type'] = programme;
    }

    const children = await Child.find(childQuery);
    const dueAssessments = [];

    for (const child of children) {
      const lastAssessment = await Assessment.findOne({ child: child._id })
        .sort({ assessmentDate: -1 });

      let isDue = false;
      let dueType = 'baseline';
      let daysSinceLastAssessment = 0;

      if (!lastAssessment) {
        // No assessment exists - baseline due
        isDue = true;
        dueType = 'baseline';
      } else {
        daysSinceLastAssessment = Math.floor((new Date() - lastAssessment.assessmentDate) / (1000 * 60 * 60 * 24));
        
        // Determine if assessment is due based on type and time elapsed
        if (lastAssessment.type === 'baseline' && daysSinceLastAssessment >= 90) {
          isDue = true;
          dueType = 'midline';
        } else if (lastAssessment.type === 'midline' && daysSinceLastAssessment >= 90) {
          isDue = true;
          dueType = 'endline';
        } else if (lastAssessment.type === 'endline' && daysSinceLastAssessment >= 180) {
          isDue = true;
          dueType = 'follow_up';
        }
      }

      if (isDue) {
        dueAssessments.push({
          child: {
            id: child._id,
            name: child.name,
            age: child.age,
            programmes: child.programmes
          },
          dueType,
          lastAssessment: lastAssessment ? {
            type: lastAssessment.type,
            date: lastAssessment.assessmentDate,
            daysSince: daysSinceLastAssessment
          } : null,
          priority: daysSinceLastAssessment > parseInt(days) ? 'high' : 'medium'
        });
      }
    }

    // Sort by priority and days since last assessment
    dueAssessments.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return (b.lastAssessment?.daysSince || 0) - (a.lastAssessment?.daysSince || 0);
    });

    res.status(200).json({
      success: true,
      count: dueAssessments.length,
      data: dueAssessments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to get age group
const getAgeGroup = (age) => {
  if (age <= 8) return '5-8';
  if (age <= 12) return '9-12';
  if (age <= 15) return '13-15';
  return '16+';
};

// Helper function to update child's assessment statistics
const updateChildAssessmentStats = async (childId) => {
  try {
    const assessmentCount = await Assessment.countDocuments({ 
      child: childId, 
      isCompleted: true 
    });

    await Child.findByIdAndUpdate(childId, {
      'stats.assessments': assessmentCount
    });
  } catch (error) {
    console.error('Error updating child assessment stats:', error);
  }
};