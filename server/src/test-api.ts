import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1';
const TEST_SUPABASE_ID = 'test-supabase-123';

// Mock auth token for testing
const headers = {
  'Authorization': `Bearer ${TEST_SUPABASE_ID}`,
  'Content-Type': 'application/json'
};

async function testAPIs() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Create Food Entry
    console.log('📝 TEST 1: Creating Food Entry...');
    const foodEntry = await axios.post(`${API_BASE}/food`, {
      mealType: 'LUNCH',
      time: '12:30',
      location: 'School cafeteria',
      description: 'Grilled chicken with rice, salad, and orange juice',
      notes: 'Good balanced meal after training',
      date: new Date().toISOString()
    }, { headers });
    
    console.log('✅ Food entry created:', {
      id: foodEntry.data.data.id,
      score: foodEntry.data.nutrition.score,
      quality: foodEntry.data.nutrition.quality
    });
    console.log('Nutrition analysis:', foodEntry.data.nutrition);
    console.log('');

    // Test 2: Create Performance Metrics
    console.log('📊 TEST 2: Creating Performance Metrics...');
    const performance = await axios.post(`${API_BASE}/performance`, {
      energyLevel: 4,
      sleepHours: 8.5,
      isTrainingDay: true,
      trainingType: 'Technical skills',
      matchDay: false,
      notes: 'Felt good during training',
      date: new Date().toISOString()
    }, { headers });
    
    console.log('✅ Performance metrics saved:', performance.data.data);
    console.log('');

    // Test 3: Get Food Entries
    console.log('🍽️ TEST 3: Fetching Food Entries...');
    const foodList = await axios.get(`${API_BASE}/food`, { headers });
    console.log(`✅ Found ${foodList.data.count} food entries`);
    console.log('');

    // Test 4: Get Performance Trends
    console.log('📈 TEST 4: Fetching Performance Trends...');
    const trends = await axios.get(`${API_BASE}/performance/trends?period=week`, { headers });
    console.log('✅ Performance trends:', trends.data.data.trends);
    console.log('');

    // Test 5: Get Nutrition Trends (Analytics)
    console.log('📊 TEST 5: Fetching Nutrition Analytics...');
    await axios.get(`${API_BASE}/analytics/nutrition-trends?period=7d`, { headers });
    console.log('✅ Analytics data retrieved');
    console.log('');

    // Test 6: Get Food Summary
    console.log('📋 TEST 6: Fetching Food Summary...');
    const summary = await axios.get(`${API_BASE}/food/summary?period=day`, { headers });
    console.log('✅ Food summary:', summary.data.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

// Run tests
testAPIs();