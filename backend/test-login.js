const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUsers = [
  {
    name: 'Tournament Director',
    email: 'director@test.com',
    password: 'password123',
    role: 'tournament_director'
  },
  {
    name: 'Team Manager',
    email: 'manager@test.com',
    password: 'password123',
    role: 'team_manager'
  },
  {
    name: 'Coach',
    email: 'coach@test.com',
    password: 'password123',
    role: 'coach'
  },
  {
    name: 'Player',
    email: 'player@test.com',
    password: 'password123',
    role: 'player'
  }
];

async function testLogin() {
  console.log('🔐 Testing Login Functionality\n');

  for (const user of testUsers) {
    try {
      console.log(`Testing login for ${user.name} (${user.role})...`);
      
      // First, try to register the user
      try {
        await axios.post(`${BASE_URL}/auth/register`, {
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role
        });
        console.log(`✅ User ${user.name} registered successfully`);
      } catch (regError) {
        if (regError.response?.status === 400 && regError.response?.data?.message?.includes('already exists')) {
          console.log(`ℹ️  User ${user.name} already exists`);
        } else {
          console.log(`❌ Registration failed for ${user.name}:`, regError.response?.data?.message || regError.message);
          continue;
        }
      }

      // Now test login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.data.success) {
        console.log(`✅ Login successful for ${user.name}`);
        console.log(`   Token: ${loginResponse.data.token.substring(0, 20)}...`);
        console.log(`   Role: ${loginResponse.data.user.role}`);
        
        // Test protected route
        const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          }
        });
        
        if (profileResponse.data.success) {
          console.log(`✅ Protected route access successful for ${user.name}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Login failed for ${user.name}:`, error.response?.data?.message || error.message);
    }
    
    console.log('---');
  }
}

async function testInvalidLogin() {
  console.log('\n🚫 Testing Invalid Login Attempts\n');
  
  const invalidAttempts = [
    {
      email: 'nonexistent@test.com',
      password: 'password123',
      description: 'Non-existent user'
    },
    {
      email: 'director@test.com',
      password: 'wrongpassword',
      description: 'Wrong password'
    },
    {
      email: 'invalid-email',
      password: 'password123',
      description: 'Invalid email format'
    }
  ];

  for (const attempt of invalidAttempts) {
    try {
      console.log(`Testing ${attempt.description}...`);
      
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: attempt.email,
        password: attempt.password
      });
      
      console.log(`❌ Unexpected success for ${attempt.description}`);
      
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        console.log(`✅ Correctly rejected ${attempt.description}: ${error.response.data.message}`);
      } else {
        console.log(`❌ Unexpected error for ${attempt.description}:`, error.message);
      }
    }
  }
}

async function testTokenValidation() {
  console.log('\n🔑 Testing Token Validation\n');
  
  try {
    // Test with invalid token
    console.log('Testing with invalid token...');
    await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('❌ Invalid token was accepted');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token correctly rejected');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  try {
    // Test without token
    console.log('Testing without token...');
    await axios.get(`${BASE_URL}/auth/me`);
    console.log('❌ Request without token was accepted');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Request without token correctly rejected');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

async function runAllTests() {
  try {
    // Check if server is running
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running\n');
    
    await testLogin();
    await testInvalidLogin();
    await testTokenValidation();
    
    console.log('\n🎉 All login tests completed!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first with: npm run dev');
    } else {
      console.log('❌ Error connecting to server:', error.message);
    }
  }
}

// Run tests
runAllTests();