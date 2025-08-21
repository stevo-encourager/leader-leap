import { createClient } from '@supabase/supabase-js';

// Configuration - replace with your actual values
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupDuplicateAssessments() {
  try {
    console.log('🔍 Starting duplicate assessment cleanup...');
    
    // Find the user ID for steve.thompson@encouragercoaching.com
    const { data: users, error: userError } = await supabase
      .auth.admin.listUsers();
    
    if (userError) {
      console.error('Error finding user:', userError);
      return;
    }
    
    const user = users.users.find(u => u.email === 'steve.thompson@encouragercoaching.com');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = user.id;
    console.log(`👤 Found user: ${user.email} (ID: ${userId})`);
    
    // Get all assessments for this user
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessment_results')
      .select('id, categories, demographics, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (assessmentError) {
      console.error('Error fetching assessments:', assessmentError);
      return;
    }
    
    console.log(`📊 Found ${assessments.length} assessments for user`);
    
    if (assessments.length <= 1) {
      console.log('✅ No duplicates found');
      return;
    }
    
    // Group assessments by signature to find duplicates
    const assessmentGroups = new Map();
    
    assessments.forEach(assessment => {
      // Create a signature based on categories and demographics
      const signature = JSON.stringify({
        categories: assessment.categories,
        demographics: assessment.demographics
      });
      
      if (!assessmentGroups.has(signature)) {
        assessmentGroups.set(signature, []);
      }
      assessmentGroups.get(signature).push(assessment);
    });
    
    console.log(`📋 Found ${assessmentGroups.size} unique assessment signatures`);
    
    // Find duplicates
    const duplicates = [];
    assessmentGroups.forEach((group, signature) => {
      if (group.length > 1) {
        console.log(`🔄 Found ${group.length} duplicate assessments for signature:`, signature.substring(0, 100) + '...');
        duplicates.push(...group.slice(1)); // Keep the first one, mark the rest as duplicates
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No exact duplicates found');
      return;
    }
    
    console.log(`🗑️  Found ${duplicates.length} duplicate assessments to remove`);
    
    // Show what will be deleted
    duplicates.forEach((assessment, index) => {
      console.log(`${index + 1}. ID: ${assessment.id}, Created: ${assessment.created_at}`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  This will permanently delete the duplicate assessments.');
    console.log('To proceed, set the environment variable CLEANUP_CONFIRM=true');
    
    if (process.env.CLEANUP_CONFIRM !== 'true') {
      console.log('❌ Cleanup cancelled. Set CLEANUP_CONFIRM=true to proceed.');
      return;
    }
    
    // Delete duplicates
    const duplicateIds = duplicates.map(a => a.id);
    const { error: deleteError } = await supabase
      .from('assessment_results')
      .delete()
      .in('id', duplicateIds);
    
    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError);
      return;
    }
    
    console.log(`✅ Successfully deleted ${duplicates.length} duplicate assessments`);
    
    // Verify cleanup
    const { data: remainingAssessments, error: verifyError } = await supabase
      .from('assessment_results')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('Error verifying cleanup:', verifyError);
      return;
    }
    
    console.log(`✅ Verification: ${remainingAssessments.length} assessments remaining`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the cleanup
cleanupDuplicateAssessments(); 