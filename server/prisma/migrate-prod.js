#!/usr/bin/env node

/**
 * Production Database Migration Script
 * Run this to apply Prisma migrations to production database
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting production database migration...\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please set the DATABASE_URL to your production database connection string');
  console.log('Example: DATABASE_URL="postgresql://..." node migrate-prod.js');
  process.exit(1);
}

// Mask the password in the URL for logging
const maskedUrl = process.env.DATABASE_URL.replace(
  /:([^@]+)@/,
  ':****@'
);
console.log(`📦 Using database: ${maskedUrl}\n`);

try {
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  // Run migrations
  console.log('\n📝 Applying database migrations...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  console.log('\n✅ Production database migration completed successfully!');
  
  // Optional: Show migration status
  console.log('\n📊 Current migration status:');
  execSync('npx prisma migrate status', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}