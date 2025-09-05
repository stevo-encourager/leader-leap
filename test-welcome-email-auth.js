// Test the welcome email function with proper Supabase client authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUzNzc0NDcsImV4cCI6MjA0MDk1MzQ0N30.vb8PYQiRAhwvJxTSU_e5bvMEF_SJVVJ7LhqmRxABBKw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testWelcomeEmailAuth = async () => {
  try {
    console.log('Testing production welcome email function with supabase client...');
    
    // Call the function using supabase.functions.invoke
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: {
        userId: 'test-user-123',
        userEmail: 'steve@leader-leap.com',
        userName: 'Steve Thompson'
      },
    });

    console.log('Function response:');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', error);
    
    if (error) {
      console.log('❌ Failed with error:', error.message);
    } else if (data?.success) {
      console.log('✅ Success! Email function worked, emailId:', data.emailId);
    } else {
      console.log('⚠️ Unexpected response:', data);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
};

testWelcomeEmailAuth();