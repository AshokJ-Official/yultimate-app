const axios = require('axios');

const createTestUpdates = async () => {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Create test updates
    const tournamentId = '674a123456789abcdef01234';
    
    const updates = [
      {
        type: 'announcement',
        title: '🎉 Tournament Starting Soon!',
        message: 'Welcome everyone! The tournament will begin in 30 minutes. Please check in at registration.',
        priority: 'high',
        targetAudience: 'all'
      },
      {
        type: 'match_start',
        title: '🏁 Match Started',
        message: 'Team Thunder vs Team Lightning has begun on Field A',
        priority: 'medium',
        targetAudience: 'all',
        metadata: {
          matchId: '674a123456789abcdef01235'
        }
      },
      {
        type: 'score_update',
        title: '⚽ Score Update',
        message: 'Team Thunder takes the lead!',
        priority: 'medium',
        targetAudience: 'all',
        metadata: {
          score: { team1: 3, team2: 1 }
        }
      },
      {
        type: 'spirit_score',
        title: '🤝 Spirit Score Submitted',
        message: 'Team Lightning submitted spirit score for their match',
        priority: 'low',
        targetAudience: 'teams'
      },
      {
        type: 'match_end',
        title: '🏆 Match Completed',
        message: 'Team Thunder defeats Team Lightning 7-4 in an exciting match!',
        priority: 'high',
        targetAudience: 'all',
        metadata: {
          score: { team1: 7, team2: 4 }
        }
      }
    ];

    for (const update of updates) {
      const response = await axios.post(`http://localhost:5000/api/updates/tournament/${tournamentId}`, update, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Created update: ${update.title}`);
      
      // Wait 2 seconds between updates
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('🎉 All test updates created successfully!');
  } catch (error) {
    console.error('❌ Error creating updates:', error.response?.data || error.message);
  }
};

createTestUpdates();