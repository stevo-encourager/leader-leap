import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ4MzExNCwiZXhwIjoyMDYzMDU5MTE0fQ.Rzi2AnHBCgbhbAlyiP1D_cVFcStGk2yXd3M3Lwn2KXU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS Status with Direct SQL...\n');

  try {
    // Check RLS enablement
    console.log('📋 1. Checking RLS Enablement:');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'assessment_results')
        `
      });
    
    if (rlsError) {
      console.log('❌ Could not check RLS status:', rlsError.message);
    } else {
      console.log('📊 RLS Status:');
      rlsStatus?.forEach(table => {
        console.log(`   - ${table.tablename}: RLS ${table.rls_enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
      });
    }

    // Check existing policies
    console.log('\n📋 2. Checking Existing Policies:');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            cmd,
            permissive,
            roles,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'assessment_results')
          ORDER BY tablename, cmd
        `
      });
    
    if (policiesError) {
      console.log('❌ Could not check policies:', policiesError.message);
    } else {
      console.log(`📊 Found ${policies?.length || 0} policies:`);
      policies?.forEach(policy => {
        console.log(`   - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    }

    // Check table structure
    console.log('\n📋 3. Checking Table Structure:');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            table_name,
            row_security
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('profiles', 'assessment_results')
        `
      });
    
    if (tableError) {
      console.log('❌ Could not check table structure:', tableError.message);
    } else {
      console.log('📊 Table Structure:');
      tableInfo?.forEach(table => {
        console.log(`   - ${table.table_name}: RLS ${table.row_security === 'YES' ? '✅ ENABLED' : '❌ DISABLED'}`);
      });
    }

    // Summary
    console.log('\n🔒 Summary:');
    const rlsEnabled = rlsStatus?.every(t => t.rls_enabled) || false;
    const hasPolicies = policies && policies.length > 0;
    
    if (rlsEnabled && hasPolicies) {
      console.log('✅ RLS is enabled and policies are in place');
    } else if (rlsEnabled && !hasPolicies) {
      console.log('⚠️  RLS is enabled but no policies found');
    } else if (!rlsEnabled) {
      console.log('❌ RLS is not enabled on tables');
    }

  } catch (error) {
    console.error('❌ Direct SQL check failed:', error);
  }
}

// Run the check
checkRLSStatus().then(() => {
  console.log('\n✅ Direct SQL check completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Direct SQL check failed:', error);
  process.exit(1);
}); 