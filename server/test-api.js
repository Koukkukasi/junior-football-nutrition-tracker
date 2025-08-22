// Test API directly with known working token
const fetch = require('node-fetch');

async function testAPI() {
  try {
    // First get the data to see what we have
    const getResponse = await fetch('http://localhost:3001/api/v1/food', {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    
    console.log('GET status:', getResponse.status);
    const getData = await getResponse.text();
    console.log('GET response:', getData);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();