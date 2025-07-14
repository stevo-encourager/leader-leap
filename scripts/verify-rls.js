import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODMxMTQsImV4cCI6MjA2MzA1OTExNH0.5FtaIZBVaUnwrQjIEslDlStE3-T0TqxKdHvsZglM24o';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyRLS() {
  console.log('🔒 Verifying RLS Implementation...\n');

  try {
    // Test 1: Try to access data without authentication (should be blocked by RLS)
    console.log('📋 Test 1: Unauthenticated Access (should be blocked)');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    const { data: assessmentsData, error: assessmentsError } = await supabase
      .from('assessment_results')
      .select('*')
      .limit(1);
    
    console.log(`📊 Profiles access: ${profilesError ? '❌ BLOCKED (Good!)' : '⚠️ ALLOWED (Security Issue!)'}`);
    console.log(`📊 Assessment results access: ${assessmentsError ? '❌ BLOCKED (Good!)' : '⚠️ ALLOWED (Security Issue!)'}`);
    
    if (profilesError) {
      console.log(`   Profiles error: ${profilesError.message}`);
    }
    if (assessmentsError) {
      console.log(`   Assessment results error: ${assessmentsError.message}`);
    }

    // Test 2: Check if we can get policy information
    console.log('\n📋 Test 2: Policy Information');
    
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('schemaname', 'public');
      
      if (policiesError) {
        console.log('❌ Could not access policy information (this is normal for anon key)');
      } else {
        console.log(`✅ Found ${policies?.length || 0} policies`);
        policies?.forEach(policy => {
          console.log(`   - ${policy.policyname} on ${policy.tablename} (${policy.cmd})`);
        });
      }
    } catch (error) {
      console.log('❌ Could not check policies (this is expected with anon key)');
    }

    // Test 3: Check table structure
    console.log('\n📋 Test 3: Table Structure');
    
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .in('table_name', ['profiles', 'assessment_results']);
      
      if (tableError) {
        console.log('❌ Could not access table information');
      } else {
        console.log('✅ Tables found:');
        tableInfo?.forEach(table => {
          console.log(`   - ${table.table_name} (${table.table_type})`);
        });
      }
    } catch (error) {
      console.log('❌ Could not check table structure');
    }

    // Summary
    console.log('\n🔒 RLS Verification Summary:');
    
    const profilesBlocked = profilesError && profilesError.message.includes('policy');
    const assessmentsBlocked = assessmentsError && assessmentsError.message.includes('policy');
    
    if (profilesBlocked && assessmentsBlocked) {
      console.log('✅ RLS appears to be working correctly!');
      console.log('✅ Unauthenticated access is properly blocked');
      console.log('✅ This indicates your security policies are active');
    } else {
      console.log('⚠️  RLS may not be working as expected');
      console.log('⚠️  Unauthenticated access should be blocked');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test with authenticated users to ensure they can access their own data');
    console.log('2. Test that users cannot access other users\' data');
    console.log('3. Verify admin functions still work correctly');
    console.log('4. Run the full security audit with service role key');

  } catch (error) {
    console.error('❌ RLS verification failed:', error);
  }
}

// Run the verification
verifyRLS().then(() => {
  console.log('\n✅ RLS verification completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ RLS verification failed:', error);
  process.exit(1);
}); 