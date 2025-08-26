// Test script to verify production API is working
const testProductionAPI = async () => {
  console.log('Testing production API...\n');
  
  const API_URL = 'https://junior-football-nutrition-server.onrender.com';
  
  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch(`${API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  // Test 2: API v1 health
  console.log('\n2. Testing API v1 health endpoint...');
  try {
    const apiHealthResponse = await fetch(`${API_URL}/api/v1/health`);
    const apiHealthData = await apiHealthResponse.json();
    console.log('✅ API health:', apiHealthData);
  } catch (error) {
    console.error('❌ API health failed:', error.message);
  }
  
  // Test 3: Food test endpoint (no auth)
  console.log('\n3. Testing food test endpoint...');
  try {
    const foodTestResponse = await fetch(`${API_URL}/api/v1/food/test`);
    const foodTestData = await foodTestResponse.json();
    console.log('✅ Food test:', foodTestData);
  } catch (error) {
    console.error('❌ Food test failed:', error.message);
  }
  
  // Test 4: CORS headers check
  console.log('\n4. Testing CORS headers with client origin...');
  try {
    const corsResponse = await fetch(`${API_URL}/api/v1/health`, {
      headers: {
        'Origin': 'https://junior-football-nutrition-client.onrender.com'
      }
    });
    
    console.log('CORS Headers:');
    console.log('  Access-Control-Allow-Origin:', corsResponse.headers.get('access-control-allow-origin'));
    console.log('  Access-Control-Allow-Credentials:', corsResponse.headers.get('access-control-allow-credentials'));
    
    const corsData = await corsResponse.json();
    console.log('✅ CORS test response:', corsData);
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
  
  // Test 5: POST request simulation
  console.log('\n5. Testing POST to food endpoint (should fail with no auth)...');
  try {
    const postResponse = await fetch(`${API_URL}/api/v1/food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://junior-football-nutrition-client.onrender.com'
      },
      body: JSON.stringify({
        mealType: 'LUNCH',
        time: '12:00',
        location: 'School',
        description: 'Test meal',
        notes: 'Test from script'
      })
    });
    
    const postData = await postResponse.json();
    if (postResponse.status === 401) {
      console.log('✅ Auth check working (401 expected):', postData);
    } else {
      console.log('Response status:', postResponse.status);
      console.log('Response:', postData);
    }
  } catch (error) {
    console.error('❌ POST test failed:', error.message);
  }
  
  console.log('\n✨ Production API tests complete!');
};

// Run the test
testProductionAPI();