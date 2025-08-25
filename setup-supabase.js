// Supabase Setup Helper Script
// Run this after creating your Supabase project

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Instructions:
// 1. Create your Supabase project at https://supabase.com/dashboard
// 2. Replace these values with your actual credentials:
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your Project URL
const SUPABASE_ANON_KEY = 'your-anon-key-here'; // Replace with your Anon Key
const SUPABASE_SERVICE_KEY = 'your-service-key-here'; // Replace with your Service Role Key (for admin tasks)

// Create .env.local file for client
function createClientEnv() {
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=http://localhost:3001
`;

  fs.writeFileSync(
    path.join(__dirname, 'client', '.env.local'),
    envContent,
    'utf8'
  );
  console.log('✅ Created client/.env.local');
}

// Create .env file for server
function createServerEnv() {
  // Extract project ref from URL
  const projectRef = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)[1];
  
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-DB-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres
NODE_ENV=development
PORT=3001

# Supabase Configuration (for server-side auth validation)
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}
`;

  fs.writeFileSync(
    path.join(__dirname, 'server', '.env'),
    envContent,
    'utf8'
  );
  console.log('✅ Created server/.env');
  console.log('⚠️  Remember to update DATABASE_URL with your database password!');
}

// Display SQL to run in Supabase SQL Editor
function displaySQLInstructions() {
  const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('\n📋 SQL SETUP INSTRUCTIONS:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Click "SQL Editor" in the sidebar');
  console.log('3. Click "New query"');
  console.log('4. Copy and paste the SQL from: supabase/schema.sql');
  console.log('5. Click "Run" to create all tables and policies');
  console.log('\n✅ Schema file location: ' + schemaPath);
}

// Main setup function
async function setupSupabase() {
  console.log('🚀 Supabase Setup Helper\n');
  
  if (SUPABASE_URL === 'https://your-project.supabase.co') {
    console.log('❌ Please update this script with your actual Supabase credentials first!');
    console.log('\nSteps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Create a new project named "junior-football-nutrition"');
    console.log('3. Go to Settings → API');
    console.log('4. Copy your Project URL and keys');
    console.log('5. Update the values at the top of this script');
    console.log('6. Run this script again: node setup-supabase.js');
    return;
  }
  
  try {
    // Create environment files
    createClientEnv();
    createServerEnv();
    
    // Display SQL instructions
    displaySQLInstructions();
    
    console.log('\n✅ Setup complete! Next steps:');
    console.log('1. Update server/.env with your database password');
    console.log('2. Run the SQL schema in Supabase SQL Editor');
    console.log('3. Start your development servers:');
    console.log('   cd server && npm run dev');
    console.log('   cd client && npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run setup
setupSupabase();