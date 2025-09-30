#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server');

    // Read and execute the setup SQL file
    const sqlFile = path.join(__dirname, 'setup-database.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Executing database setup script...');
    await connection.execute(sqlContent);
    console.log('✅ Database setup completed successfully!');
    
    // Test the new database connection
    console.log('🧪 Testing database connection...');
    await connection.execute('USE dynamicbiz_security');
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Found ${rows[0].count} users in the database`);
    
    console.log('\n🎉 Setup completed! You can now start the application.');
    console.log('\nDefault admin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('1. MySQL server is running');
      console.log('2. Database credentials are correct');
      console.log('3. User has proper permissions');
      console.log('\nYou can modify the credentials in .env file or run:');
      console.log('DB_USER=your_username DB_PASSWORD=your_password node setup-db.js');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Cannot connect to MySQL server. Please check:');
      console.log('1. MySQL server is running');
      console.log('2. Host and port are correct');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase();
