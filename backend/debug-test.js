#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugTest() {
  console.log('🔍 Debug Test - Checking specific API issues...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthRes.status, healthRes.data.message);

    // Test 2: User Registration
    console.log('\n2. Testing User Registration...');
    const userData = {
      name: 'Debug User',
      email: `debug${Date.now()}@test.com`, // Unique email
      password: 'password123',
      role: 'tournament_director'
    };
    
    try {
      const regRes = await axios.post(`${BASE_URL}/auth/register`, userData);
      console.log('✅ User Registration:', regRes.status, 'Token received:', !!regRes.data.token);
      
      // Test 3: Login with same user
      console.log('\n3. Testing Login...');
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      console.log('✅ Login:', loginRes.status, 'Token received:', !!loginRes.data.token);
      
      const token = loginRes.data.token;
      
      // Test 4: Get Current User
      console.log('\n4. Testing Get Current User...');
      const meRes = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get Current User:', meRes.status, 'User:', meRes.data.user.name);
      
      // Test 5: Create Tournament
      console.log('\n5. Testing Create Tournament...');
      const tournamentData = {
        title: 'Debug Tournament',
        description: 'Debug tournament description',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 172800000),
        location: 'Debug Location',
        fields: [{ name: 'Field 1' }]
      };
      
      const tournamentRes = await axios.post(`${BASE_URL}/tournaments`, tournamentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Create Tournament:', tournamentRes.status, 'ID:', tournamentRes.data.data._id);
      
    } catch (regError) {
      console.log('❌ Registration Error:', regError.response?.status, regError.response?.data);
    }

  } catch (error) {
    console.log('❌ Debug Test Error:', error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return false;
  }
}

checkServer().then(running => {
  if (running) {
    debugTest();
  }
});