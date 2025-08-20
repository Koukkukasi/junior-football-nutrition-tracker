-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'nutrition_user') THEN
      CREATE ROLE nutrition_user LOGIN PASSWORD 'nutrition_pass';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE nutrition_tracker OWNER nutrition_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nutrition_tracker')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE nutrition_tracker TO nutrition_user;