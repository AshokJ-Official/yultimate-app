const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const testMediaUpload = async () => {
  try {
    // First login to get token
    // Create test user first
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'tournament_director'
      });
    } catch (e) {
      // User might already exist
    }

    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token:', token);

    // Test media upload endpoint
    const tournamentId = '674a123456789abcdef01234';
    
    const response = await axios.post(`http://localhost:5000/api/media/tournament/${tournamentId}`, {
      type: 'photo',
      category: 'general',
      title: 'Test Photo',
      description: 'Test description'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Media upload test response:', response.data);
  } catch (error) {
    console.error('Error testing media upload:', error.response?.data || error.message);
  }
};

testMediaUpload();