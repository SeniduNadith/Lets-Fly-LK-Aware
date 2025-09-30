const mysql = require('mysql2/promise');

async function setupDatabase() {
  // Try different common passwords
  const passwords = ['', 'root', 'password', '123456', 'mysql'];
  
  for (const password of passwords) {
    try {
      console.log(`Trying password: ${password || '(empty)'}`);
      
      const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: password
      });
      
      console.log('✅ Connected to MySQL successfully!');
      
      // Check if database exists
      const [databases] = await connection.execute(`
        SELECT SCHEMA_NAME 
        FROM information_schema.SCHEMATA 
        WHERE SCHEMA_NAME = 'dynamicbiz_security'
      `);
      
      if (databases.length === 0) {
        console.log('Creating database...');
        await connection.execute('CREATE DATABASE dynamicbiz_security CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Database created');
      } else {
        console.log('✅ Database already exists');
      }
      
      // Use the database
      await connection.execute('USE dynamicbiz_security');
      
      // Check if tables exist
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'dynamicbiz_security'
      `);
      
      if (tables.length === 0) {
        console.log('Database is empty. Please run the setup script to create tables.');
        console.log('Run: node setup-db.js');
      } else {
        console.log(`✅ Found ${tables.length} tables`);
        
        // Check for incomplete attempts
        const [incomplete] = await connection.execute(`
          SELECT COUNT(*) as count 
          FROM quiz_attempts 
          WHERE completed_at IS NULL
        `);
        
        console.log(`Found ${incomplete[0].count} incomplete attempts`);
        
        if (incomplete[0].count > 0) {
          const [result] = await connection.execute(`
            DELETE FROM quiz_attempts 
            WHERE completed_at IS NULL
          `);
          console.log(`Cleared ${result.affectedRows} incomplete attempts`);
        }
      }
      
      await connection.end();
      console.log('✅ Database setup completed successfully!');
      console.log(`\nUse password: "${password}" in your .env file`);
      return;
      
    } catch (error) {
      console.log(`❌ Failed with password "${password}": ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not connect to MySQL with any common password.');
  console.log('Please check your MySQL installation and root password.');
}

setupDatabase();
