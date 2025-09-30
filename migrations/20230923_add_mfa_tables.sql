-- Add MFA related tables and columns

-- Add MFA settings table
CREATE TABLE IF NOT EXISTS user_mfa (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mfa_secret VARCHAR(255),
  mfa_recovery_codes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_mfa (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add MFA enabled column to users table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'mfa_enabled';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) = 0,
  'ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE',
  'SELECT 1'
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mfa_enabled ON users(mfa_enabled);
