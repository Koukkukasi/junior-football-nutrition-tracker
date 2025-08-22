const fetch = require('node-fetch');

async function testPerformanceSubmission() {
  try {
    console.log('Testing performance data submission...');
    
    // This should simulate a browser request
    // You'll need to replace with a real JWT token from your browser
    const authToken = 'REPLACE_WITH_REAL_TOKEN'; // Get this from browser dev tools
    
    const requestData = {
      energyLevel: 4,
      sleepHours: 8.5,
      isTrainingDay: true,
      trainingType: 'Strength training',
      matchDay: false,
      notes: 'Felt great during training'
    };
    
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await fetch('http://localhost:3001/api/v1/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'Origin': 'http://localhost:5174'
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.text();
    console.log('Response body:', responseData);
    
    if (!response.ok) {
      console.error('Request failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('To test with a real token:');
console.log('1. Open browser dev tools on your app');
console.log('2. Go to Network tab');
console.log('3. Make a request that includes authorization');
console.log('4. Copy the Bearer token from request headers');
console.log('5. Replace REPLACE_WITH_REAL_TOKEN above');
console.log('6. Run: node test-performance-browser.js');

testPerformanceSubmission();