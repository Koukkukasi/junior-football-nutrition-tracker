// Test script for feedback API endpoint
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'https://junior-football-nutrition-tracker.onrender.com';

async function testFeedback() {
  console.log('Testing feedback endpoint at:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/api/v1/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'general',
        message: 'Test feedback message from test script',
        rating: 5,
        userAgent: 'TestScript/1.0',
        url: '/test',
        timestamp: new Date().toISOString()
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Feedback submission successful!');
    } else {
      console.log('❌ Feedback submission failed:', data.error);
    }
  } catch (error) {
    console.error('Error testing feedback:', error);
  }
}

// Run the test
testFeedback();