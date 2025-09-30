const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  try {
    console.log('Testing password hashing...');
    
    // Test different passwords
    const passwords = ['admin123', 'password123', 'test123'];
    
    for (const password of passwords) {
      console.log(`\nTesting password: ${password}`);
      
      // Hash the password
      const hash = await bcrypt.hash(password, 10);
      console.log(`Hash: ${hash}`);
      
      // Test against the admin hash from database
      const adminHash = '$2b$10$rQJ8N5vK8N5vK8N5vK8N5uK8N5vK8N5vK8N5vK8N5vK8N5vK8N5vK';
      const isValid = await bcrypt.compare(password, adminHash);
      console.log(`Matches admin hash: ${isValid}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPasswordHash();
