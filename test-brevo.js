const fetch = require('node-fetch');

async function testBrevoIntegration() {
  console.log('Testing Brevo API integration...\n');

  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/brevo-health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    console.log('');
  } catch (error) {
    console.error('Health check failed:', error.message);
    console.log('Make sure the Brevo API server is running on port 3001\n');
    return;
  }

  // Test subscription endpoint
  try {
    console.log('2. Testing subscription endpoint...');
    const testContact = {
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const subscribeResponse = await fetch('http://localhost:3001/api/subscribe-brevo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContact),
    });
    
    const subscribeData = await subscribeResponse.json();
    console.log('Subscription result:', subscribeData);
    console.log('');
  } catch (error) {
    console.error('Subscription test failed:', error.message);
  }

  // Test invalid email
  try {
    console.log('3. Testing invalid email...');
    const invalidContact = {
      email: 'invalid-email',
      name: 'Test User'
    };
    
    const invalidResponse = await fetch('http://localhost:3001/api/subscribe-brevo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidContact),
    });
    
    const invalidData = await invalidResponse.json();
    console.log('Invalid email result:', invalidData);
    console.log('');
  } catch (error) {
    console.error('Invalid email test failed:', error.message);
  }

  console.log('Test completed!');
}

// Run the test
testBrevoIntegration().catch(console.error); 