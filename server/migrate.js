const { connectDB, getPool } = require('./config/db');
require('dotenv').config();

async function runMigration() {
  await connectDB();
  const pool = getPool();

  try {
    console.log('Running migration...');
    
    // Check if Users table exists and drop it if needed to recreate properly
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sysobjects WHERE name='Users' and xtype='U')
      DROP TABLE Users;
      
      CREATE TABLE Users (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Phone NVARCHAR(50) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
      )
    `);
    console.log('Users table created successfully.');

    // Add UserID to Orders if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID('Orders') AND name = 'UserID'
      )
      ALTER TABLE Orders
      ADD UserID INT NULL FOREIGN KEY REFERENCES Users(ID)
    `);
    console.log('UserID column added to Orders table.');

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
