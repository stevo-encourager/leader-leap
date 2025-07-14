import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODMxMTQsImV4cCI6MjA2MzA1OTExNH0.5FtaIZBVaUnwrQjIEslDlStE3-T0TqxKdHvsZglM24o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRLS() {
  console.log('🧪 Testing RLS Implementation...\n');

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

    // Test 2: Check if we can sign in and access data
    console.log('\n📋 Test 2: Authenticated Access');
    
    // Try to sign in with a test user (you'll need to provide credentials)
    console.log('⚠️  To test authenticated access, you need to provide test credentials');
    console.log('   This test requires a valid user account to verify RLS policies');
    
    // Test 3: Check if tables exist and are accessible
    console.log('\n📋 Test 3: Table Accessibility');
    
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'assessment_results']);
      
      if (tableError) {
        console.log('❌ Could not access table information:', tableError.message);
      } else {
        console.log('✅ Tables found:');
        tableInfo?.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      }
    } catch (error) {
      console.log('❌ Could not check table structure:', error.message);
    }

    // Summary
    console.log('\n🔒 RLS Test Summary:');
    
    if (profilesBlocked && assessmentsBlocked) {
      console.log('✅ RLS appears to be working correctly!');
      console.log('✅ Unauthenticated access is properly blocked');
      console.log('✅ This indicates your security policies are active');
    } else if (profilesError && assessmentsError) {
      console.log('⚠️  Access is blocked, but may not be due to RLS');
      console.log('⚠️  Check if tables exist and are accessible');
    } else {
      console.log('❌ RLS may not be working as expected');
      console.log('❌ Unauthenticated access should be blocked');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test with authenticated users to ensure they can access their own data');
    console.log('2. Test that users cannot access other users\' data');
    console.log('3. Verify admin functions still work correctly');
    console.log('4. Run the full security audit with service role key');

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