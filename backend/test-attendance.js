const mongoose = require('mongoose');
const Session = require('./models/Session');
const Child = require('./models/Child');
require('dotenv').config();

const addTestAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the first session
    const session = await Session.findOne().sort({ createdAt: -1 });
    if (!session) {
      console.log('No sessions found. Create a session first.');
      return;
    }

    // Get some children
    const children = await Child.find().limit(5);
    if (children.length === 0) {
      console.log('No children found. Create some children first.');
      return;
    }

    console.log(`Adding ${children.length} children to session: ${session.title}`);

    // Clear existing attendance
    session.attendance = [];

    // Add children to attendance
    children.forEach(child => {
      session.attendance.push({
        child: child._id,
        present: false,
        markedAt: new Date()
      });
    });

    await session.save();
    console.log('✅ Test attendance data added successfully!');
    console.log(`Session ID: ${session._id}`);
    console.log(`Children added: ${children.map(c => c.name).join(', ')}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
};

addTestAttendance();