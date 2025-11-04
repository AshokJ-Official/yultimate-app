#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugTeamIssues() {
  console.log('🔍 Debug Team Issues...\n');

  try {
    // Step 1: Create Tournament Director
    console.log('1. Creating Tournament Director...');
    const directorData = {
      name: 'Debug Director',
      email: `director${Date.now()}@test.com`,
      password: 'password123',
      role: 'tournament_director'
    };
    
    const directorRes = await axios.post(`${BASE_URL}/auth/register`, directorData);
    const directorToken = directorRes.data.token;
    console.log('✅ Director created');

    // Step 2: Create Tournament
    console.log('\n2. Creating Tournament...');
    const tournamentData = {
      title: 'Debug Tournament',
      description: 'Debug tournament description',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 172800000),
      location: 'Debug Location',
      fields: [{ name: 'Field 1' }]
    };
    
    const tournamentRes = await axios.post(`${BASE_URL}/tournaments`, tournamentData, {
      headers: { Authorization: `Bearer ${directorToken}` }
    });
    const tournamentId = tournamentRes.data.data._id;
    console.log('✅ Tournament created:', tournamentId);

    // Step 3: Create Team Manager
    console.log('\n3. Creating Team Manager...');
    const managerData = {
      name: 'Debug Manager',
      email: `manager${Date.now()}@test.com`,
      password: 'password123',
      role: 'team_manager'
    };
    
    const managerRes = await axios.post(`${BASE_URL}/auth/register`, managerData);
    const managerToken = managerRes.data.token;
    console.log('✅ Team Manager created');

    // Step 4: Try to Create Team (This should fail)
    console.log('\n4. Creating Team...');
    const teamData = {
      name: 'Debug Team',
      tournament: tournamentId
    };
    
    try {
      const teamRes = await axios.post(`${BASE_URL}/teams`, teamData, {
        headers: { Authorization: `Bearer ${managerToken}` }
      });
      console.log('✅ Team created:', teamRes.data.data._id);
      
      // Step 5: Try to Approve Team
      console.log('\n5. Approving Team...');
      try {
        const approveRes = await axios.put(`${BASE_URL}/teams/${teamRes.data.data._id}/status`, 
          { status: 'approved' },
          { headers: { Authorization: `Bearer ${directorToken}` } }
        );
        console.log('✅ Team approved');
      } catch (approveError) {
        console.log('❌ Approve Team Error:', approveError.response?.status, approveError.response?.data);
      }
      
    } catch (teamError) {
      console.log('❌ Create Team Error:', teamError.response?.status, teamError.response?.data);
    }

  } catch (error) {
    console.log('❌ Debug Error:', error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
    }
  }
}

// Check server and run debug
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    console.log('❌ Server not running. Start with: npm run dev');
    return false;
  }
}

checkServer().then(running => {
  if (running) {
    debugTeamIssues();
  }
});