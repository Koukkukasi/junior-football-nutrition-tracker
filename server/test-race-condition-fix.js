const axios = require('axios');

async function testPerformanceSubmission() {
  try {
    // Test data
    const performanceData = {
      energyLevel: 4,
      sleepHours: 8.5,
      isTrainingDay: true,
      trainingType: 'team_practice',
      matchDay: false,
      notes: 'Test from race condition fix verification'
    };

    // You'll need to replace this with a valid Bearer token from your frontend
    const authToken = 'your_valid_bearer_token_here';

    console.log('Testing performance submission with race condition fix...');
    console.log('Data:', performanceData);

    const response = await axios.post(
      'http://localhost:3001/api/v1/performance',
      performanceData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Performance submission worked');
    console.log('Response:', response.data);

  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

console.log('Race Condition Fix Test');
console.log('======================');
console.log('This script tests the fixed performance submission endpoint.');
console.log('To use it:');
console.log('1. Get a valid Bearer token from your frontend application');
console.log('2. Replace "your_valid_bearer_token_here" with the actual token');
console.log('3. Run: node test-race-condition-fix.js');
console.log('');

// Uncomment the line below when you have a valid token
// testPerformanceSubmission();