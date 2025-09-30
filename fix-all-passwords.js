const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAllPasswords() {
  try {
    console.log('Fixing all user passwords...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'dynamicbiz_user',
      password: '2003',
      database: 'dynamicbiz_security'
    });

    // Get all users
    const [users] = await connection.execute('SELECT id, username FROM users');
    
    console.log(`Found ${users.length} users to update:`);
    users.forEach(user => console.log(`- ${user.username}`));
    
    // Update passwords for each user
    for (const user of users) {
      let password;
      
      // Set different passwords for different users
      if (user.username === 'admin') {
        password = 'admin123';
      } else if (user.username === 'zeny') {
        password = 'test123';
      } else if (user.username === 'user1') {
        password = 'password123';
      } else {
        password = 'password123'; // default password
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, user.id]
      );
      
      console.log(`✅ Updated password for ${user.username} (password: ${password})`);
    }
    
    console.log('\n✅ All passwords updated successfully!');
    
    await connection.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixAllPasswords();
