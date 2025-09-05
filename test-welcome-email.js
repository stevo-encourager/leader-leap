// Test script to call the production welcome email function
const testWelcomeEmail = async () => {
  const supabaseUrl = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNzc0NDcsImV4cCI6MjA0MDk1MzQ0N30.vb8PYQiRAhwvJxTSU_e5bvMEF_SJVVJ7LhqmRxABBKw';
  
  try {
    console.log('Testing production welcome email function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test-user-123',
        userEmail: 'steve@leader-leap.com',
        userName: 'Steve Thompson'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Success! Email function worked');
    } else {
      console.log('❌ Failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error calling function:', error.message);
  }
};

testWelcomeEmail();