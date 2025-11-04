const mongoose = require('mongoose');
const Session = require('./models/Session');
const HomeVisit = require('./models/HomeVisit');
const User = require('./models/User');
require('dotenv').config();

const debugCoachWorkload = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a coach
    const coach = await User.findOne({ role: 'coach' });
    if (!coach) {
      console.log('No coach found');
      return;
    }

    console.log(`\n=== Debugging Coach: ${coach.name} (${coach._id}) ===`);

    // Check sessions assigned to this coach
    const sessions = await Session.find({
      $or: [
        { coach: coach._id },
        { assistantCoaches: coach._id }
      ]
    }).populate('assignedBy', 'name');

    console.log(`\nSessions found: ${sessions.length}`);
    sessions.forEach(session => {
      console.log(`- ${session.title} (${session._id})`);
      console.log(`  Coach: ${session.coach}`);
      console.log(`  Assistant Coaches: ${session.assistantCoaches}`);
      console.log(`  Assigned By: ${session.assignedBy?.name || 'Not assigned'}`);
      console.log(`  Date: ${session.scheduledDate}`);
      console.log(`  Status: ${session.status}`);
    });

    // Check home visits
    const homeVisits = await HomeVisit.find({
      coach: coach._id
    }).populate('assignedBy', 'name');

    console.log(`\nHome Visits found: ${homeVisits.length}`);
    homeVisits.forEach(visit => {
      console.log(`- Visit ${visit._id}`);
      console.log(`  Coach: ${visit.coach}`);
      console.log(`  Assigned By: ${visit.assignedBy?.name || 'Not assigned'}`);
      console.log(`  Date: ${visit.scheduledDate || visit.visitDate}`);
      console.log(`  Status: ${visit.status}`);
    });

    // Test the workload API logic
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      inProgressSessions: sessions.filter(s => s.status === 'in_progress').length,
      totalHomeVisits: homeVisits.length,
      completedVisits: homeVisits.filter(v => v.status === 'completed').length,
      upcomingVisits: homeVisits.filter(v => v.status === 'planned' || v.status === 'scheduled').length,
      totalHours: 0
    };

    console.log('\n=== Calculated Stats ===');
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

debugCoachWorkload();