-- ==============================================================================
-- BLOODBRIDGE – INITIAL MYSQL USERS & ROLES CONFIGURATION SCRIPT
-- Execute as MySQL administrative user (e.g. root) via MySQL Workbench or CLI
-- Engine: MySQL 8.0.46 (InnoDB)
--
-- STRICT ISOLATION NOTICE:
-- 1. This script ONLY creates and manages the `bloodbridge_dev` and `bloodbridge_test` databases.
-- 2. It does NOT touch, query, modify, or reference the `Brightloop` database or connection.
-- ==============================================================================

-- 1. Create Dedicated Databases with utf8mb4 encoding & collation
CREATE DATABASE IF NOT EXISTS `bloodbridge_dev`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `bloodbridge_test`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 2. Create Application User (bloodbridge_app)
-- Restricted to DML (SELECT, INSERT, UPDATE, DELETE, EXECUTE) on BloodBridge databases only
-- Replace 'AppSecurePass2026!' with your actual secure local credential
CREATE USER IF NOT EXISTS 'bloodbridge_app'@'localhost' IDENTIFIED BY 'AppSecurePass2026!';
CREATE USER IF NOT EXISTS 'bloodbridge_app'@'127.0.0.1' IDENTIFIED BY 'AppSecurePass2026!';

-- Grant DML privileges on development database
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON `bloodbridge_dev`.* TO 'bloodbridge_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON `bloodbridge_dev`.* TO 'bloodbridge_app'@'127.0.0.1';

-- Grant DML privileges on test database
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON `bloodbridge_test`.* TO 'bloodbridge_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON `bloodbridge_test`.* TO 'bloodbridge_app'@'127.0.0.1';

-- 3. Create Migration User (bloodbridge_migrate)
-- Used exclusively for schema migrations, table creation, index management and test fixtures
-- Replace 'MigrateSecurePass2026!' with your actual secure local credential
CREATE USER IF NOT EXISTS 'bloodbridge_migrate'@'localhost' IDENTIFIED BY 'MigrateSecurePass2026!';
CREATE USER IF NOT EXISTS 'bloodbridge_migrate'@'127.0.0.1' IDENTIFIED BY 'MigrateSecurePass2026!';

-- Grant DDL + DML privileges on development database
GRANT ALL PRIVILEGES ON `bloodbridge_dev`.* TO 'bloodbridge_migrate'@'localhost';
GRANT ALL PRIVILEGES ON `bloodbridge_dev`.* TO 'bloodbridge_migrate'@'127.0.0.1';

-- Grant DDL + DML privileges on test database
GRANT ALL PRIVILEGES ON `bloodbridge_test`.* TO 'bloodbridge_migrate'@'localhost';
GRANT ALL PRIVILEGES ON `bloodbridge_test`.* TO 'bloodbridge_migrate'@'127.0.0.1';

FLUSH PRIVILEGES;

-- Verification Queries (Run to confirm):
-- SHOW DATABASES LIKE 'bloodbridge%';
-- SELECT User, Host FROM mysql.user WHERE User LIKE 'bloodbridge%';
