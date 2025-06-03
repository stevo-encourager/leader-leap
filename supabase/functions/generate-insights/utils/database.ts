
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkExistingInsights = async (assessmentId: string, supabaseUrl: string, supabaseServiceKey: string): Promise<string | null> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  console.log('CRITICAL CHECK: Verifying existing insights for assessment:', assessmentId);
  console.log('TEST ASSESSMENT CHECK: Is test assessment?', isTestAssessment);
  
  // DOUBLE CHECK: First verify we have a valid assessment ID
  if (!assessmentId || assessmentId.trim() === '') {
    console.log('CRITICAL CHECK: No assessment ID provided - cannot check for existing insights');
    return null;
  }
  
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('assessment_results')
    .select('ai_insights')
    .eq('id', assessmentId)
    .single();

  if (fetchError) {
    console.error('CRITICAL CHECK: Error fetching existing assessment:', fetchError);
    throw new Error('Could not check for existing insights');
  }

  // ENHANCED CHECK: More thorough validation of existing insights
  if (existingAssessment && 
      existingAssessment.ai_insights && 
      existingAssessment.ai_insights.trim() !== '' &&
      existingAssessment.ai_insights.trim() !== 'null' &&
      existingAssessment.ai_insights.trim() !== 'undefined') {
    
    // SPECIAL CASE: For test assessment, allow regeneration
    if (isTestAssessment) {
      console.log('TEST ASSESSMENT: Found existing insights but allowing regeneration for test assessment');
      return null; // Return null to allow regeneration
    } else {
      console.log('CRITICAL PROTECTION: Found existing insights - ABSOLUTELY NEVER regenerating');
      console.log('CRITICAL PROTECTION: Returning saved insights to prevent any overwriting');
      return existingAssessment.ai_insights;
    }
  }

  console.log('CRITICAL CHECK: No existing insights found - proceeding with generation (ONLY ONCE)');
  return null;
};

export const saveInsights = async (
  assessmentId: string, 
  insights: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
): Promise<void> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  console.log('FINAL PROTECTION: Double-checking before saving insights for assessment:', assessmentId);
  console.log('TEST ASSESSMENT SAVE: Is test assessment?', isTestAssessment);
  
  // DOUBLE CHECK: Verify we're not overwriting existing insights (except for test assessment)
  if (!isTestAssessment) {
    const existingCheck = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
    if (existingCheck) {
      console.log('FINAL PROTECTION: Insights already exist - ABORTING save to prevent overwrite');
      throw new Error('Insights already exist for this assessment - will not overwrite');
    }
  } else {
    console.log('TEST ASSESSMENT SAVE: Allowing save/overwrite for test assessment');
  }
  
  console.log('FINAL PROTECTION: Confirmed no existing insights or test assessment - proceeding with save');
  console.log('SAVING: New insights for assessment:', assessmentId);
  if (isTestAssessment) {
    console.log('TEST ASSESSMENT: Saving insights (can be overwritten in future)');
  } else {
    console.log('PRODUCTION ASSESSMENT: Saving insights (will NEVER be regenerated)');
  }
  
  const { error: updateError } = await supabase
    .from('assessment_results')
    .update({ ai_insights: insights })
    .eq('id', assessmentId);

  if (updateError) {
    console.error('SAVE ERROR: Failed to save insights to database:', updateError);
    throw new Error('Failed to save insights to database');
  } else {
    if (isTestAssessment) {
      console.log('SAVE SUCCESS: Test assessment insights saved - can be regenerated');
    } else {
      console.log('SAVE SUCCESS: Insights permanently saved - will be reused forever');
    }
  }
};
