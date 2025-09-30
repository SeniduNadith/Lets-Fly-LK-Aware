const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('Fixing admin password...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'dynamicbiz_user',
      password: '2003',
      database: 'dynamicbiz_security'
    });

    // Hash the password 'admin123'
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('New password hash:', passwordHash);
    
    // Update the admin user with the correct password hash
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE username = ?',
      [passwordHash, 'admin']
    );
    
    console.log('Update result:', result);
    console.log('✅ Admin password updated successfully!');
    
    // Verify the update
    const [adminUser] = await connection.execute('SELECT username, password_hash FROM users WHERE username = ?', ['admin']);
    console.log('Updated admin user:', {
      username: adminUser[0].username,
      password_hash: adminUser[0].password_hash.substring(0, 30) + '...'
    });
    
    // Test the password
    const isValid = await bcrypt.compare(password, adminUser[0].password_hash);
    console.log(`Password verification test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
    
    await connection.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixAdminPassword();
