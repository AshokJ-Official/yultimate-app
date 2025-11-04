const request = require('supertest');
const { app } = require('../server');

describe('Y-Ultimate Management Platform API Tests', () => {
  let authToken;
  let tournamentDirectorToken;
  let coachToken;
  let tournamentId;
  let teamId;
  let matchId;
  let childId;
  let sessionId;
  let homeVisitId;
  let assessmentId;

  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'tournament_director'
  };

  const testCoach = {
    name: 'Test Coach',
    email: 'coach@example.com',
    password: 'password123',
    role: 'coach'
  };

  const testTournament = {
    title: 'Test Tournament',
    description: 'Test tournament description',
    startDate: new Date(Date.now() + 86400000), // Tomorrow
    endDate: new Date(Date.now() + 172800000), // Day after tomorrow
    location: 'Test Location',
    fields: [
      { name: 'Field 1', location: 'North Side' },
      { name: 'Field 2', location: 'South Side' }
    ]
  };

  const testTeam = {
    name: 'Test Team',
    players: []
  };

  const testChild = {
    name: 'Test Child',
    age: 12,
    gender: 'male',
    guardianName: 'Test Guardian',
    guardianPhone: '1234567890',
    programmes: [{
      type: 'school',
      location: 'Test School',
      isActive: true
    }]
  };

  // Authentication Tests
  describe('Authentication APIs', () => {
    test('POST /api/auth/register - Register tournament director', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      tournamentDirectorToken = res.body.token;
    });

    test('POST /api/auth/register - Register coach', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testCoach);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      coachToken = res.body.token;
    });

    test('POST /api/auth/login - Login user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    test('GET /api/auth/me - Get current user', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
    });

    test('PUT /api/auth/profile - Update profile', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Updated Name');
    });
  });

  // Tournament Management Tests
  describe('Tournament Management APIs', () => {
    test('POST /api/tournaments - Create tournament', async () => {
      const res = await request(app)
        .post('/api/tournaments')
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send(testTournament);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(testTournament.title);
      tournamentId = res.body.data._id;
    });

    test('GET /api/tournaments - Get all tournaments', async () => {
      const res = await request(app).get('/api/tournaments');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/tournaments/:id - Get single tournament', async () => {
      const res = await request(app).get(`/api/tournaments/${tournamentId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(tournamentId);
    });

    test('PUT /api/tournaments/:id - Update tournament', async () => {
      const res = await request(app)
        .put(`/api/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send({ title: 'Updated Tournament' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Tournament');
    });

    test('POST /api/tournaments/:id/visitors - Register visitor', async () => {
      const res = await request(app)
        .post(`/api/tournaments/${tournamentId}/visitors`)
        .send({
          name: 'Test Visitor',
          email: 'visitor@example.com',
          phone: '9876543210'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/tournaments/:id/dashboard - Get tournament dashboard', async () => {
      const res = await request(app)
        .get(`/api/tournaments/${tournamentId}/dashboard`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tournament).toBeDefined();
    });
  });

  // Team Management Tests
  describe('Team Management APIs', () => {
    test('POST /api/teams - Register team', async () => {
      const teamData = { ...testTeam, tournament: tournamentId };
      const res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send(teamData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(testTeam.name);
      teamId = res.body.data._id;
    });

    test('GET /api/teams/tournament/:tournamentId - Get teams by tournament', async () => {
      const res = await request(app).get(`/api/teams/tournament/${tournamentId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/teams/:id - Get single team', async () => {
      const res = await request(app).get(`/api/teams/${teamId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(teamId);
    });

    test('PUT /api/teams/:id/status - Approve team', async () => {
      const res = await request(app)
        .put(`/api/teams/${teamId}/status`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });
  });

  // Match Management Tests
  describe('Match Management APIs', () => {
    beforeAll(async () => {
      // Create a second team for matches
      const team2Data = { name: 'Test Team 2', tournament: tournamentId };
      const team2Res = await request(app)
        .post('/api/teams')
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send(team2Data);
      
      const team2Id = team2Res.body.data._id;

      // Create a match
      const matchData = {
        tournament: tournamentId,
        teamA: teamId,
        teamB: team2Id,
        field: 'Field 1',
        scheduledTime: new Date(Date.now() + 86400000),
        round: 'Round 1'
      };

      const matchRes = await request(app)
        .post('/api/matches')
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send(matchData);
      
      matchId = matchRes.body.data._id;
    });

    test('GET /api/matches/tournament/:tournamentId - Get matches by tournament', async () => {
      const res = await request(app).get(`/api/matches/tournament/${tournamentId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/matches/:id - Get single match', async () => {
      const res = await request(app).get(`/api/matches/${matchId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(matchId);
    });

    test('PUT /api/matches/:id/score - Update match score', async () => {
      const res = await request(app)
        .put(`/api/matches/${matchId}/score`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send({ teamAScore: 15, teamBScore: 12 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score.teamA).toBe(15);
    });

    test('PUT /api/matches/:id/complete - Complete match', async () => {
      const res = await request(app)
        .put(`/api/matches/${matchId}/complete`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });

    test('GET /api/matches/live - Get live matches', async () => {
      const res = await request(app).get('/api/matches/live');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Spirit Scoring Tests
  describe('Spirit Scoring APIs', () => {
    test('POST /api/spirit-scores - Submit spirit score', async () => {
      const spiritData = {
        matchId: matchId,
        scoredTeamId: teamId,
        scores: {
          rulesKnowledge: 3,
          foulsAndContact: 3,
          fairMindedness: 4,
          positiveAttitude: 3,
          communication: 3
        },
        comments: 'Great sportsmanship!'
      };

      const res = await request(app)
        .post('/api/spirit-scores')
        .set('Authorization', `Bearer ${tournamentDirectorToken}`)
        .send(spiritData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalScore).toBe(16);
    });

    test('GET /api/spirit-scores/matches/:matchId - Get spirit scores by match', async () => {
      const res = await request(app).get(`/api/spirit-scores/matches/${matchId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/spirit-scores/tournaments/:tournamentId/leaderboard - Get spirit leaderboard', async () => {
      const res = await request(app).get(`/api/spirit-scores/tournaments/${tournamentId}/leaderboard`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Child Management Tests
  describe('Child Management APIs', () => {
    test('POST /api/children - Register child', async () => {
      const res = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${coachToken}`)
        .send(testChild);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(testChild.name);
      childId = res.body.data._id;
    });

    test('GET /api/children - Get all children', async () => {
      const res = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/children/:id - Get single child', async () => {
      const res = await request(app)
        .get(`/api/children/${childId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.child._id).toBe(childId);
    });

    test('PUT /api/children/:id - Update child', async () => {
      const res = await request(app)
        .put(`/api/children/${childId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({ age: 13 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.age).toBe(13);
    });

    test('GET /api/children/:id/attendance - Get child attendance', async () => {
      const res = await request(app)
        .get(`/api/children/${childId}/attendance`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
    });
  });

  // Session Management Tests
  describe('Session Management APIs', () => {
    test('POST /api/sessions - Create session', async () => {
      const sessionData = {
        title: 'Test Session',
        type: 'school',
        location: { name: 'Test School', address: 'Test Address' },
        scheduledDate: new Date(),
        scheduledStartTime: new Date(),
        scheduledEndTime: new Date(Date.now() + 3600000)
      };

      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send(sessionData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(sessionData.title);
      sessionId = res.body.data._id;
    });

    test('GET /api/sessions - Get all sessions', async () => {
      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/sessions/:id - Get single session', async () => {
      const res = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(sessionId);
    });

    test('PUT /api/sessions/:id/start - Start session', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}/start`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in_progress');
    });

    test('PUT /api/sessions/:id/attendance - Mark attendance', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}/attendance`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({ childId: childId, present: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('PUT /api/sessions/:id/complete - Complete session', async () => {
      const res = await request(app)
        .put(`/api/sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });
  });

  // Home Visit Tests
  describe('Home Visit APIs', () => {
    test('POST /api/home-visits - Create home visit', async () => {
      const visitData = {
        child: childId,
        visitDate: new Date(),
        visitTime: '10:00 AM',
        duration: 60,
        purpose: 'initial_assessment'
      };

      const res = await request(app)
        .post('/api/home-visits')
        .set('Authorization', `Bearer ${coachToken}`)
        .send(visitData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.purpose).toBe(visitData.purpose);
      homeVisitId = res.body.data._id;
    });

    test('GET /api/home-visits - Get all home visits', async () => {
      const res = await request(app)
        .get('/api/home-visits')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/home-visits/:id - Get single home visit', async () => {
      const res = await request(app)
        .get(`/api/home-visits/${homeVisitId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(homeVisitId);
    });

    test('PUT /api/home-visits/:id/complete - Complete home visit', async () => {
      const res = await request(app)
        .put(`/api/home-visits/${homeVisitId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
    });

    test('GET /api/home-visits/children/:childId - Get home visits by child', async () => {
      const res = await request(app)
        .get(`/api/home-visits/children/${childId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/home-visits/upcoming - Get upcoming home visits', async () => {
      const res = await request(app)
        .get('/api/home-visits/upcoming')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Assessment Tests
  describe('Assessment APIs', () => {
    test('POST /api/assessments - Create assessment', async () => {
      const assessmentData = {
        child: childId,
        type: 'baseline',
        assessmentDate: new Date(),
        programme: 'school',
        lsasScores: {
          communication: { score: 3, notes: 'Good communication' },
          teamwork: { score: 4, notes: 'Excellent teamwork' },
          leadership: { score: 2, notes: 'Needs improvement' },
          problemSolving: { score: 3, notes: 'Average problem solving' },
          selfConfidence: { score: 3, notes: 'Confident child' },
          emotionalRegulation: { score: 3, notes: 'Good emotional control' },
          socialSkills: { score: 4, notes: 'Very social' },
          resilience: { score: 3, notes: 'Shows resilience' }
        }
      };

      const res = await request(app)
        .post('/api/assessments')
        .set('Authorization', `Bearer ${coachToken}`)
        .send(assessmentData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe(assessmentData.type);
      assessmentId = res.body.data._id;
    });

    test('GET /api/assessments - Get all assessments', async () => {
      const res = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    test('GET /api/assessments/:id - Get single assessment', async () => {
      const res = await request(app)
        .get(`/api/assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(assessmentId);
    });

    test('PUT /api/assessments/:id/complete - Complete assessment', async () => {
      const res = await request(app)
        .put(`/api/assessments/${assessmentId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isCompleted).toBe(true);
    });

    test('GET /api/assessments/children/:childId - Get assessments by child', async () => {
      const res = await request(app)
        .get(`/api/assessments/children/${childId}`)
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/assessments/due - Get due assessments', async () => {
      const res = await request(app)
        .get('/api/assessments/due')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Reporting Tests
  describe('Reporting APIs', () => {
    test('GET /api/reports/tournament/:tournamentId - Get tournament report', async () => {
      const res = await request(app)
        .get(`/api/reports/tournament/${tournamentId}`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tournament).toBeDefined();
    });

    test('GET /api/reports/coaching - Get coaching report', async () => {
      const res = await request(app)
        .get('/api/reports/coaching')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
    });

    test('GET /api/reports/tournament/:tournamentId/export - Export tournament data', async () => {
      const res = await request(app)
        .get(`/api/reports/tournament/${tournamentId}/export`)
        .set('Authorization', `Bearer ${tournamentDirectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tournament).toBeDefined();
    });

    test('GET /api/reports/coaching/export - Export coaching data', async () => {
      const res = await request(app)
        .get('/api/reports/coaching/export')
        .set('Authorization', `Bearer ${coachToken}`);

      expect(res.status).toBe(200);
      expect(res.body.children).toBeDefined();
    });
  });

  // Health Check Test
  describe('Health Check', () => {
    test('GET /api/health - Health check', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Y-Ultimate Management Platform API is running');
    });
  });
});