-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'nutrition_user') THEN
      CREATE USER nutrition_user WITH PASSWORD 'nutrition_pass';
   END IF;
END
$do$;

-- Create database if not exists
SELECT 'CREATE DATABASE nutrition_tracker OWNER nutrition_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nutrition_tracker')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE nutrition_tracker TO nutrition_user;

-- Connect to the database
\c nutrition_tracker

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO nutrition_user;
GRANT CREATE ON SCHEMA public TO nutrition_user;