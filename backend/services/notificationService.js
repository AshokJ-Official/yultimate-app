const Bull = require('bull');
const redis = require('../config/redis');
const {
  sendTournamentRegistrationConfirmation,
  sendTeamApprovalNotification,
  sendMatchReminder,
  sendSessionReminder,
  sendHomeVisitScheduled,
  sendAssessmentDueNotification
} = require('../utils/emailService');

// Create notification queue
const notificationQueue = new Bull('notification queue', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  }
});

// Process notification jobs
notificationQueue.process('tournament-registration', async (job) => {
  const { email, tournamentName, teamName } = job.data;
  await sendTournamentRegistrationConfirmation(email, tournamentName, teamName);
});

notificationQueue.process('team-approval', async (job) => {
  const { email, tournamentName, teamName, status } = job.data;
  await sendTeamApprovalNotification(email, tournamentName, teamName, status);
});

notificationQueue.process('match-reminder', async (job) => {
  const { email, matchDetails } = job.data;
  await sendMatchReminder(email, matchDetails);
});

notificationQueue.process('session-reminder', async (job) => {
  const { email, sessionDetails } = job.data;
  await sendSessionReminder(email, sessionDetails);
});

notificationQueue.process('home-visit-scheduled', async (job) => {
  const { email, visitDetails } = job.data;
  await sendHomeVisitScheduled(email, visitDetails);
});

notificationQueue.process('assessment-due', async (job) => {
  const { email, childName, assessmentType } = job.data;
  await sendAssessmentDueNotification(email, childName, assessmentType);
});

// Queue notification functions
const queueTournamentRegistrationNotification = (email, tournamentName, teamName) => {
  notificationQueue.add('tournament-registration', {
    email,
    tournamentName,
    teamName
  });
};

const queueTeamApprovalNotification = (email, tournamentName, teamName, status) => {
  notificationQueue.add('team-approval', {
    email,
    tournamentName,
    teamName,
    status
  });
};

const queueMatchReminder = (email, matchDetails, delay = 0) => {
  notificationQueue.add('match-reminder', {
    email,
    matchDetails
  }, {
    delay // Delay in milliseconds
  });
};

const queueSessionReminder = (email, sessionDetails, delay = 0) => {
  notificationQueue.add('session-reminder', {
    email,
    sessionDetails
  }, {
    delay
  });
};

const queueHomeVisitNotification = (email, visitDetails) => {
  notificationQueue.add('home-visit-scheduled', {
    email,
    visitDetails
  });
};

const queueAssessmentDueNotification = (email, childName, assessmentType) => {
  notificationQueue.add('assessment-due', {
    email,
    childName,
    assessmentType
  });
};

// Schedule recurring notifications
const scheduleMatchReminders = async () => {
  const Match = require('../models/Match');
  const Team = require('../models/Team');
  
  // Find matches scheduled for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);
  
  const upcomingMatches = await Match.find({
    scheduledTime: {
      $gte: tomorrow,
      $lte: endOfTomorrow
    },
    status: 'scheduled'
  }).populate('teamA teamB tournament');
  
  for (const match of upcomingMatches) {
    const matchDetails = {
      tournament: match.tournament.title,
      date: match.scheduledTime.toDateString(),
      time: match.scheduledTime.toTimeString(),
      field: match.field,
      opponent: {
        teamA: match.teamB.name,
        teamB: match.teamA.name
      }
    };
    
    // Get team managers' emails
    const teamA = await Team.findById(match.teamA).populate('manager');
    const teamB = await Team.findById(match.teamB).populate('manager');
    
    if (teamA.manager.email) {
      queueMatchReminder(teamA.manager.email, {
        ...matchDetails,
        yourTeam: teamA.name,
        opponent: teamB.name
      });
    }
    
    if (teamB.manager.email) {
      queueMatchReminder(teamB.manager.email, {
        ...matchDetails,
        yourTeam: teamB.name,
        opponent: teamA.name
      });
    }
  }
};

const scheduleSessionReminders = async () => {
  const Session = require('../models/Session');
  
  // Find sessions scheduled for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);
  
  const upcomingSessions = await Session.find({
    scheduledDate: {
      $gte: tomorrow,
      $lte: endOfTomorrow
    },
    status: 'scheduled'
  }).populate('coach');
  
  for (const session of upcomingSessions) {
    const sessionDetails = {
      title: session.title,
      date: session.scheduledDate.toDateString(),
      time: session.scheduledStartTime.toTimeString(),
      location: session.location.name,
      type: session.type
    };
    
    if (session.coach.email) {
      queueSessionReminder(session.coach.email, sessionDetails);
    }
  }
};

const scheduleAssessmentReminders = async () => {
  const Child = require('../models/Child');
  const Assessment = require('../models/Assessment');
  
  // Find children who need assessments
  const children = await Child.find({ isActive: true });
  
  for (const child of children) {
    const lastAssessment = await Assessment.findOne({ child: child._id })
      .sort({ assessmentDate: -1 });
    
    let isDue = false;
    let dueType = 'baseline';
    
    if (!lastAssessment) {
      isDue = true;
      dueType = 'baseline';
    } else {
      const daysSinceLastAssessment = Math.floor((new Date() - lastAssessment.assessmentDate) / (1000 * 60 * 60 * 24));
      
      if (lastAssessment.type === 'baseline' && daysSinceLastAssessment >= 85) { // 5 days before due
        isDue = true;
        dueType = 'midline';
      } else if (lastAssessment.type === 'midline' && daysSinceLastAssessment >= 85) {
        isDue = true;
        dueType = 'endline';
      } else if (lastAssessment.type === 'endline' && daysSinceLastAssessment >= 175) {
        isDue = true;
        dueType = 'follow_up';
      }
    }
    
    if (isDue) {
      // Find child's coach
      const activeProgram = child.programmes.find(p => p.isActive);
      if (activeProgram && activeProgram.coach) {
        const User = require('../models/User');
        const coach = await User.findById(activeProgram.coach);
        
        if (coach && coach.email) {
          queueAssessmentDueNotification(coach.email, child.name, dueType);
        }
      }
    }
  }
};

// Set up cron jobs (run daily at 8 AM)
const setupNotificationScheduler = () => {
  const cron = require('node-cron');
  
  // Daily reminders at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily notification scheduler...');
    
    try {
      await scheduleMatchReminders();
      await scheduleSessionReminders();
      await scheduleAssessmentReminders();
      
      console.log('Daily notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling daily notifications:', error);
    }
  });
  
  console.log('Notification scheduler initialized');
};

module.exports = {
  notificationQueue,
  queueTournamentRegistrationNotification,
  queueTeamApprovalNotification,
  queueMatchReminder,
  queueSessionReminder,
  queueHomeVisitNotification,
  queueAssessmentDueNotification,
  setupNotificationScheduler
};