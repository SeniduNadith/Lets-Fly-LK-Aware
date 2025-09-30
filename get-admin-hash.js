const mysql = require('mysql2/promise');

async function getAdminHash() {
  try {
    console.log('Getting admin password hash from database...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'dynamicbiz_user',
      password: '2003',
      database: 'dynamicbiz_security'
    });

    const [adminUser] = await connection.execute('SELECT username, password_hash FROM users WHERE username = ?', ['admin']);
    
    if (adminUser.length > 0) {
      console.log('Admin user found:');
      console.log('Username:', adminUser[0].username);
      console.log('Password hash:', adminUser[0].password_hash);
    } else {
      console.log('Admin user not found!');
    }

    await connection.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getAdminHash();
