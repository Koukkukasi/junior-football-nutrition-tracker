// Test script to verify local setup with Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlhkefgrafakbrcwquhv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwOTU5ODgsImV4cCI6MjA3MTY3MTk4OH0.AANSsmhGbFPhlSdk7kVRDFAQ7YAxEqjY0s9D5UyK0ho';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Auth error:', error);
    } else {
      console.log('✅ Connected to Supabase successfully');
      console.log('   Session:', data.session ? 'Active' : 'No active session');
    }
    
    // Test 2: Try to fetch from users table
    console.log('\n2. Testing database access...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);
    
    if (usersError) {
      console.log('⚠️  Users table error (expected if not set up):', usersError.message);
    } else {
      console.log('✅ Can access users table');
      console.log('   Users found:', users?.length || 0);
    }
    
    // Test 3: Check food_entries table
    console.log('\n3. Testing food_entries table...');
    const { data: entries, error: entriesError } = await supabase
      .from('food_entries')
      .select('id, description')
      .limit(1);
    
    if (entriesError) {
      console.log('⚠️  Food entries table error:', entriesError.message);
    } else {
      console.log('✅ Can access food_entries table');
      console.log('   Entries found:', entries?.length || 0);
    }
    
    console.log('\n✨ Supabase connection test complete!');
    console.log('\nYou can access the frontend at: http://localhost:5174');
    console.log('The frontend will connect directly to Supabase for now.');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSupabaseConnection();