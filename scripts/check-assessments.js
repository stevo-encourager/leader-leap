import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAssessments() {
  try {
    console.log('🔍 Checking assessments in database...');
    
    // Get all assessments
    const { data: assessments, error: assessmentError } = await supabase
      .from('assessment_results')
      .select('id, user_id, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (assessmentError) {
      console.error('Error fetching assessments:', assessmentError);
      return;
    }
    
    console.log(`📊 Found ${assessments.length} assessments (showing latest 20):`);
    
    assessments.forEach((assessment, index) => {
      console.log(`${index + 1}. ID: ${assessment.id}, User: ${assessment.user_id}, Created: ${assessment.created_at}`);
    });
    
    // Check for any assessments with the same user_id
    const userCounts = {};
    assessments.forEach(assessment => {
      const userId = assessment.user_id;
      userCounts[userId] = (userCounts[userId] || 0) + 1;
    });
    
    console.log('\n📋 Assessment counts by user:');
    Object.entries(userCounts).forEach(([userId, count]) => {
      console.log(`User ${userId}: ${count} assessments`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkAssessments(); 