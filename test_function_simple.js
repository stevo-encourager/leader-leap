// Simple test to call the Edge function directly
async function testEdgeFunction() {
  const testPayload = {
    userId: "test-user-123",
    userEmail: "test@example.com",
    userName: "Test User"
  };

  try {
    console.log('Testing Edge function with payload:', testPayload);

    const response = await fetch('https://hrgoxcdixvpmcbfgltea.supabase.co/functions/v1/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + 'test-key' // This will likely fail auth, but we should see our debug logs
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testEdgeFunction();