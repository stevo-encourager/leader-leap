
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkExistingInsights = async (assessmentId: string, supabaseUrl: string, supabaseServiceKey: string): Promise<string | null> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('CRITICAL CHECK: Verifying existing insights for assessment:', assessmentId);
  
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
    
    console.log('CRITICAL PROTECTION: Found existing insights - ABSOLUTELY NEVER regenerating');
    console.log('CRITICAL PROTECTION: Returning saved insights to prevent any overwriting');
    return existingAssessment.ai_insights;
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
  
  // DOUBLE CHECK: Verify we're not overwriting existing insights
  console.log('FINAL PROTECTION: Double-checking before saving insights for assessment:', assessmentId);
  
  const existingCheck = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
  if (existingCheck) {
    console.log('FINAL PROTECTION: Insights already exist - ABORTING save to prevent overwrite');
    throw new Error('Insights already exist for this assessment - will not overwrite');
  }
  
  console.log('FINAL PROTECTION: Confirmed no existing insights - proceeding with save');
  console.log('SAVING: New insights for assessment (will NEVER be regenerated):', assessmentId);
  
  const { error: updateError } = await supabase
    .from('assessment_results')
    .update({ ai_insights: insights })
    .eq('id', assessmentId);

  if (updateError) {
    console.error('SAVE ERROR: Failed to save insights to database:', updateError);
    throw new Error('Failed to save insights to database');
  } else {
    console.log('SAVE SUCCESS: Insights permanently saved - will be reused forever');
  }
};
