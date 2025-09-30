const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'dynamicbiz_user',
      password: '2003',
      database: 'dynamicbiz_security'
    });

    console.log('✅ Database connected successfully!');

    // Test query to get users
    const [users] = await connection.execute('SELECT id, username, email, first_name, last_name, is_active FROM users');
    
    console.log('\nUsers in database:');
    console.table(users);

    // Test a specific user
    const [adminUser] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (adminUser.length > 0) {
      console.log('\nAdmin user found:');
      console.log({
        id: adminUser[0].id,
        username: adminUser[0].username,
        email: adminUser[0].email,
        is_active: adminUser[0].is_active,
        password_hash: adminUser[0].password_hash.substring(0, 20) + '...'
      });
    } else {
      console.log('\n❌ Admin user not found!');
    }

    await connection.end();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase();