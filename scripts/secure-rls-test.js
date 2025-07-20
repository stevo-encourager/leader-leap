import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
  console.error('\n📋 Please create a .env.local file with your credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLS() {
  console.log('🧪 Testing RLS Implementation (Secure Version)...\n');

  try {
    // Test 1: Unauthenticated access (should be blocked)
    console.log('📋 Test 1: Unauthenticated Access');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    const { data: assessmentsData, error: assessmentsError } = await supabase
      .from('assessment_results')
      .select('*')
      .limit(1);
    
    // Treat empty array as BLOCKED (Good!)
    const profilesBlocked = (profilesError && (profilesError.message.includes('policy') || profilesError.message.includes('RLS'))) || (Array.isArray(profilesData) && profilesData.length === 0);
    const assessmentsBlocked = (assessmentsError && (assessmentsError.message.includes('policy') || assessmentsError.message.includes('RLS'))) || (Array.isArray(assessmentsData) && assessmentsData.length === 0);

    console.log(`📊 Profiles access: ${profilesBlocked ? '❌ BLOCKED (Good!)' : '⚠️ ALLOWED (Security Issue!)'}`);
    console.log(`📊 Assessment results access: ${assessmentsBlocked ? '❌ BLOCKED (Good!)' : '⚠️ ALLOWED (Security Issue!)'}`);
    
    if (profilesError) {
      console.log(`   Profiles error: ${profilesError.message}`);
    }
    if (assessmentsError) {
      console.log(`   Assessment results error: ${assessmentsError.message}`);
    }

    // Summary
    console.log('\n🔒 RLS Test Summary:');
    
    if (profilesBlocked && assessmentsBlocked) {
      console.log('✅ RLS appears to be working correctly!');
      console.log('✅ Unauthenticated access is properly blocked');
      console.log('✅ This indicates your security policies are active');
    } else {
      console.log('❌ RLS may not be working as expected');
      console.log('❌ Unauthenticated access should be blocked');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test with authenticated users to ensure they can access their own data');
    console.log('2. Test that users cannot access other users\' data');
    console.log('3. Verify admin functions still work correctly');

  } catch (error) {
    console.error('❌ RLS test failed:', error);
  }
}

// Run the test
testRLS().then(() => {
  console.log('\n✅ RLS test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ RLS test failed:', error);
  process.exit(1);
}); 