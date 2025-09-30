const axios = require('axios');

// Test the simplified login functionality
async function testLogin() {
  try {
    console.log('Testing simplified login...');
    
    // Test with the demo credentials from your database
    const testCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'zeny', password: 'test123' },
      { username: 'user1', password: 'password123' }
    ];

    for (const creds of testCredentials) {
      try {
        console.log(`\nTesting login for: ${creds.username}`);
        
        const response = await axios.post('http://localhost:3001/api/auth/login', {
          username: creds.username,
          password: creds.password
        });

        console.log('✅ Login successful!');
        console.log('Response:', {
          message: response.data.message,
          user: {
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
            department: response.data.user.department
          },
          hasToken: !!response.data.token
        });
        
      } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.error || error.message);
        console.log('Full error response:', error.response?.data);
      }
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testLogin();
