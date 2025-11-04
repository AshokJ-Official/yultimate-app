#!/usr/bin/env node

const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let coachToken = '';
let tournamentId = '';
let teamId = '';
let matchId = '';
let childId = '';
let sessionId = '';

// Test data with unique emails
const timestamp = Date.now();
const testData = {
  user: {
    name: 'Test Director',
    email: `director${timestamp}@test.com`,
    password: 'password123',
    role: 'tournament_director'
  },
  coach: {
    name: 'Test Coach',
    email: `coach${timestamp}@test.com`,
    password: 'password123',
    role: 'coach'
  },
  tournament: {
    title: 'Test Tournament',
    description: 'Test tournament description',
    startDate: new Date(Date.now() + 86400000),
    endDate: new Date(Date.now() + 172800000),
    location: 'Test Location',
    fields: [{ name: 'Field 1' }]
  },
  child: {
    name: 'Test Child',
    age: 12,
    gender: 'male',
    guardianName: 'Test Guardian',
    guardianPhone: '1234567890',
    programmes: [{ type: 'school', location: 'Test School', isActive: true }]
  }
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run test
async function runTest(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    console.log(`✅ ${name} - PASSED\n`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
  }
}

// Test functions
async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/health`);
  if (response.status !== 200 || !response.data.success) {
    throw new Error('Health check failed');
  }
}

async function testUserRegistration() {
  const response = await axios.post(`${BASE_URL}/auth/register`, testData.user);
  if (response.status !== 201 || !response.data.token) {
    throw new Error('User registration failed');
  }
  authToken = response.data.token;
}

async function testCoachRegistration() {
  const response = await axios.post(`${BASE_URL}/auth/register`, testData.coach);
  if (response.status !== 201 || !response.data.token) {
    throw new Error('Coach registration failed');
  }
  coachToken = response.data.token;
}

async function testUserLogin() {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: testData.user.email,
    password: testData.user.password
  });
  if (response.status !== 200 || !response.data.token) {
    throw new Error('User login failed');
  }
}

async function testGetCurrentUser() {
  const response = await axios.get(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.status !== 200 || response.data.user.email !== testData.user.email) {
    throw new Error('Get current user failed');
  }
}

async function testCreateTournament() {
  const response = await axios.post(`${BASE_URL}/tournaments`, testData.tournament, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create tournament failed');
  }
  tournamentId = response.data.data._id;
}

async function testGetTournaments() {
  const response = await axios.get(`${BASE_URL}/tournaments`);
  if (response.status !== 200 || !Array.isArray(response.data.data)) {
    throw new Error('Get tournaments failed');
  }
}

async function testCreateTeam() {
  // Create a team manager first
  const teamManagerData = {
    name: 'Team Manager',
    email: `manager${Date.now()}@test.com`,
    password: 'password123',
    role: 'team_manager'
  };
  
  const managerRes = await axios.post(`${BASE_URL}/auth/register`, teamManagerData);
  const managerToken = managerRes.data.token;
  
  const teamData = { name: 'Test Team', tournament: tournamentId };
  const response = await axios.post(`${BASE_URL}/teams`, teamData, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create team failed');
  }
  teamId = response.data.data._id;
}

async function testApproveTeam() {
  const response = await axios.put(`${BASE_URL}/teams/${teamId}/status`, 
    { status: 'approved' },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  if (response.status !== 200 || response.data.data.status !== 'approved') {
    throw new Error('Approve team failed');
  }
}

async function testCreateMatch() {
  // Create second team first with team manager
  const teamManager2Data = {
    name: 'Team Manager 2',
    email: `manager2${Date.now()}@test.com`,
    password: 'password123',
    role: 'team_manager'
  };
  
  const manager2Res = await axios.post(`${BASE_URL}/auth/register`, teamManager2Data);
  const manager2Token = manager2Res.data.token;
  
  const team2Data = { name: 'Test Team 2', tournament: tournamentId };
  const team2Response = await axios.post(`${BASE_URL}/teams`, team2Data, {
    headers: { Authorization: `Bearer ${manager2Token}` }
  });
  
  const matchData = {
    tournament: tournamentId,
    teamA: teamId,
    teamB: team2Response.data.data._id,
    field: 'Field 1',
    scheduledTime: new Date(Date.now() + 86400000),
    round: 'Round 1'
  };
  
  const response = await axios.post(`${BASE_URL}/matches`, matchData, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create match failed');
  }
  matchId = response.data.data._id;
}

async function testUpdateMatchScore() {
  // Create a volunteer for match scoring
  const volunteerData = {
    name: 'Test Volunteer',
    email: `volunteer${Date.now()}@test.com`,
    password: 'password123',
    role: 'volunteer'
  };
  
  const volunteerRes = await axios.post(`${BASE_URL}/auth/register`, volunteerData);
  const volunteerToken = volunteerRes.data.token;
  
  const response = await axios.put(`${BASE_URL}/matches/${matchId}/score`,
    { teamAScore: 15, teamBScore: 12 },
    { headers: { Authorization: `Bearer ${volunteerToken}` } }
  );
  if (response.status !== 200 || response.data.data.score.teamA !== 15) {
    throw new Error('Update match score failed');
  }
}

async function testSubmitSpiritScore() {
  // Create a team manager for spirit score submission
  const teamManagerData = {
    name: 'Spirit Manager',
    email: `spirit${Date.now()}@test.com`,
    password: 'password123',
    role: 'team_manager'
  };
  
  const managerRes = await axios.post(`${BASE_URL}/auth/register`, teamManagerData);
  const managerToken = managerRes.data.token;
  
  const spiritData = {
    matchId: matchId,
    scoredTeamId: teamId,
    scores: {
      rulesKnowledge: 3,
      foulsAndContact: 3,
      fairMindedness: 4,
      positiveAttitude: 3,
      communication: 3
    }
  };
  
  const response = await axios.post(`${BASE_URL}/spirit-scores`, spiritData, {
    headers: { Authorization: `Bearer ${managerToken}` }
  });
  if (response.status !== 201 || response.data.data.totalScore !== 16) {
    throw new Error('Submit spirit score failed');
  }
}

async function testRegisterChild() {
  const response = await axios.post(`${BASE_URL}/children`, testData.child, {
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Register child failed');
  }
  childId = response.data.data._id;
}

async function testCreateSession() {
  const sessionData = {
    title: 'Test Session',
    type: 'school',
    location: { name: 'Test School' },
    scheduledDate: new Date(),
    scheduledStartTime: new Date(),
    scheduledEndTime: new Date(Date.now() + 3600000)
  };
  
  const response = await axios.post(`${BASE_URL}/sessions`, sessionData, {
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create session failed');
  }
  sessionId = response.data.data._id;
}

async function testMarkAttendance() {
  const response = await axios.put(`${BASE_URL}/sessions/${sessionId}/attendance`,
    { childId: childId, present: true },
    { headers: { Authorization: `Bearer ${coachToken}` } }
  );
  if (response.status !== 200) {
    throw new Error('Mark attendance failed');
  }
}

async function testCreateHomeVisit() {
  const visitData = {
    child: childId,
    visitDate: new Date(),
    visitTime: '10:00 AM',
    duration: 60,
    purpose: 'initial_assessment'
  };
  
  const response = await axios.post(`${BASE_URL}/home-visits`, visitData, {
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create home visit failed');
  }
}

async function testCreateAssessment() {
  const assessmentData = {
    child: childId,
    type: 'baseline',
    assessmentDate: new Date(),
    programme: 'school',
    lsasScores: {
      communication: { score: 3 },
      teamwork: { score: 4 },
      leadership: { score: 2 },
      problemSolving: { score: 3 },
      selfConfidence: { score: 3 },
      emotionalRegulation: { score: 3 },
      socialSkills: { score: 4 },
      resilience: { score: 3 }
    }
  };
  
  const response = await axios.post(`${BASE_URL}/assessments`, assessmentData, {
    headers: { Authorization: `Bearer ${coachToken}` }
  });
  if (response.status !== 201 || !response.data.data._id) {
    throw new Error('Create assessment failed');
  }
}

async function testTournamentReport() {
  const response = await axios.get(`${BASE_URL}/reports/tournament/${tournamentId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  if (response.status !== 200 || !response.data.data.tournament) {
    throw new Error('Tournament report failed');
  }
}

async function testCoachingReport() {
  // Create a programme manager for coaching report
  const programmeManagerData = {
    name: 'Programme Manager',
    email: `pm${Date.now()}@test.com`,
    password: 'password123',
    role: 'programme_manager'
  };
  
  const pmRes = await axios.post(`${BASE_URL}/auth/register`, programmeManagerData);
  const pmToken = pmRes.data.token;
  
  const response = await axios.get(`${BASE_URL}/reports/coaching`, {
    headers: { Authorization: `Bearer ${pmToken}` }
  });
  if (response.status !== 200 || !response.data.data.summary) {
    throw new Error('Coaching report failed');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Y-Ultimate Management Platform API Tests...\n');
  
  // Authentication Tests
  await runTest('Health Check', testHealthCheck);
  await runTest('User Registration', testUserRegistration);
  await runTest('Coach Registration', testCoachRegistration);
  await runTest('User Login', testUserLogin);
  await runTest('Get Current User', testGetCurrentUser);
  
  // Tournament Management Tests
  await runTest('Create Tournament', testCreateTournament);
  await runTest('Get Tournaments', testGetTournaments);
  await runTest('Create Team', testCreateTeam);
  await runTest('Approve Team', testApproveTeam);
  await runTest('Create Match', testCreateMatch);
  await runTest('Update Match Score', testUpdateMatchScore);
  await runTest('Submit Spirit Score', testSubmitSpiritScore);
  
  // Coaching Programme Tests
  await runTest('Register Child', testRegisterChild);
  await runTest('Create Session', testCreateSession);
  await runTest('Mark Attendance', testMarkAttendance);
  await runTest('Create Home Visit', testCreateHomeVisit);
  await runTest('Create Assessment', testCreateAssessment);
  
  // Reporting Tests
  await runTest('Tournament Report', testTournamentReport);
  await runTest('Coaching Report', testCoachingReport);
  
  // Print summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! All APIs are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
    console.log('\nFailed tests:');
    results.tests.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`- ${test.name}: ${test.error}`);
    });
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running. Starting tests...\n');
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
    return false;
  }
}

// Run tests
checkServer().then(serverRunning => {
  if (serverRunning) {
    runAllTests().catch(error => {
      console.error('❌ Test runner error:', error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

module.exports = { runAllTests };