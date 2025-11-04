const axios = require('axios');

const createUpdate = async () => {
  try {
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Create update for the specific tournament
    const tournamentId = '6905d1cb53b8767e9dfa27f2';
    
    const updateData = {
      type: 'announcement',
      title: 'Test Update from Form',
      message: 'This is a test update to verify the live updates system is working',
      priority: 'high',
      targetAudience: 'all'
    };

    const response = await axios.post(`http://localhost:5000/api/updates/tournament/${tournamentId}`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Update created:', response.data);
    
    // Fetch updates to verify
    const fetchResponse = await axios.get(`http://localhost:5000/api/updates/tournament/${tournamentId}`);
    console.log('📡 All updates for tournament:', fetchResponse.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

createUpdate();