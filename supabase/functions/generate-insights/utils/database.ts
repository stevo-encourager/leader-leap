
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkExistingInsights = async (assessmentId: string, supabaseUrl: string, supabaseServiceKey: string, forceRegenerate?: boolean): Promise<string | null> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  console.log('🔍 DATABASE CHECK EXISTING INSIGHTS:', {
    assessmentId,
    isTestAssessment,
    forceRegenerate
  });
  
  // DOUBLE CHECK: First verify we have a valid assessment ID
  if (!assessmentId || assessmentId.trim() === '') {
    console.log('🔍 NO ASSESSMENT ID - Cannot check for existing insights');
    return null;
  }
  
  // CRITICAL FIX: For test assessment with force regenerate, skip database check entirely
  if (isTestAssessment && forceRegenerate) {
    console.log('🔍 TEST ASSESSMENT + FORCE REGENERATE - Skipping database check to force new generation');
    return null; // Return null to force new generation
  }
  
  console.log('🔍 QUERYING DATABASE FOR EXISTING INSIGHTS...');
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('assessment_results')
    .select('ai_insights')
    .eq('id', assessmentId)
    .single();

  console.log('🔍 DATABASE QUERY RESULT:', {
    existingAssessment,
    fetchError,
    hasInsights: !!existingAssessment?.ai_insights
  });

  if (fetchError) {
    console.error('🔍 ERROR FETCHING EXISTING ASSESSMENT:', fetchError);
    throw new Error('Could not check for existing insights');
  }

  // ENHANCED CHECK: More thorough validation of existing insights
  if (existingAssessment && 
      existingAssessment.ai_insights && 
      existingAssessment.ai_insights.trim() !== '' &&
      existingAssessment.ai_insights.trim() !== 'null' &&
      existingAssessment.ai_insights.trim() !== 'undefined') {
    
    console.log('🔍 FOUND VALID EXISTING INSIGHTS:', {
      insightsLength: existingAssessment.ai_insights.length,
      isTestAssessment,
      willReturnExisting: true
    });
    
    return existingAssessment.ai_insights;
  }

  console.log('🔍 NO EXISTING INSIGHTS FOUND - Proceeding with generation');
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
  
  console.log('🔍 SAVING INSIGHTS:', {
    assessmentId,
    isTestAssessment,
    insightsLength: insights.length
  });
  
  // DOUBLE CHECK: Verify we're not overwriting existing insights (except for test assessment)
  if (!isTestAssessment) {
    console.log('🔍 NON-TEST ASSESSMENT - Checking for existing insights before save');
    const existingCheck = await checkExistingInsights(assessmentId, supabaseUrl, supabaseServiceKey);
    if (existingCheck) {
      console.log('🔍 EXISTING INSIGHTS FOUND - ABORTING save to prevent overwrite');
      throw new Error('Insights already exist for this assessment - will not overwrite');
    }
  } else {
    console.log('🔍 TEST ASSESSMENT - Allowing save/overwrite');
  }
  
  console.log('🔍 UPDATING DATABASE WITH NEW INSIGHTS...');
  const { error: updateError } = await supabase
    .from('assessment_results')
    .update({ ai_insights: insights })
    .eq('id', assessmentId);

  if (updateError) {
    console.error('🔍 SAVE ERROR:', updateError);
    throw new Error('Failed to save insights to database');
  } else {
    console.log('🔍 SAVE SUCCESS:', {
      assessmentId,
      isTestAssessment,
      message: isTestAssessment ? 'Test assessment insights saved (can be regenerated)' : 'Insights permanently saved'
    });
  }
};
