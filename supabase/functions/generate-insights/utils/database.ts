
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkExistingInsights = async (assessmentId: string, supabaseUrl: string, supabaseServiceKey: string, forceRegenerate?: boolean): Promise<string | null> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  console.log('🔍 DATABASE CHECK EXISTING INSIGHTS:', {
    assessmentId,
    isTestAssessment,
    forceRegenerate
  });
  
  // DOUBLE CHECK: First verify we have a valid assessment ID
  if (!assessmentId || assessmentId.trim() === '') {
    console.log('🔍 NO ASSESSMENT ID - Will generate insights without database linkage');
    return null; // Continue with generation but without database check
  }
  
  // CRITICAL FIX: For test assessment with force regenerate, skip database check entirely
  if (isTestAssessment && forceRegenerate) {
    console.log('🔍 TEST ASSESSMENT + FORCE REGENERATE - Skipping database check to force new generation');
    return null; // Return null to force new generation
  }
  
  try {
    console.log('🔍 QUERYING DATABASE FOR EXISTING INSIGHTS...');
    const { data: existingAssessment, error: fetchError } = await supabase
      .from('assessment_results')
      .select('ai_insights')
      .eq('id', assessmentId)
      .maybeSingle(); // CRITICAL FIX: Use maybeSingle() instead of single() to handle cases where assessment doesn't exist yet

    console.log('🔍 DATABASE QUERY RESULT:', {
      existingAssessment,
      fetchError,
      hasInsights: !!existingAssessment?.ai_insights
    });

    if (fetchError) {
      console.error('🔍 ERROR FETCHING EXISTING ASSESSMENT:', fetchError);
      // CRITICAL FIX: Don't throw error if assessment doesn't exist yet - this is normal for new assessments
      if (fetchError.code === 'PGRST116') {
        console.log('🔍 ASSESSMENT NOT FOUND IN DATABASE - This is normal for new assessments');
        return null;
      }
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
  } catch (error) {
    console.error('🔍 UNEXPECTED ERROR IN checkExistingInsights:', error);
    // CRITICAL FIX: Return null instead of throwing to allow insights generation to continue
    return null;
  }
};

export const saveInsights = async (
  assessmentId: string, 
  insights: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
): Promise<void> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = '08a5f01a-db17-474d-a3e8-c53bedbc34c8';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;
  
  console.log('🔍 SAVING INSIGHTS:', {
    assessmentId,
    isTestAssessment,
    insightsLength: insights.length
  });
  
  try {
    // For all assessments, check if the assessment record exists before trying to update
    console.log('🔍 Checking if assessment exists before save');
    const { data: existingAssessment, error: checkError } = await supabase
      .from('assessment_results')
      .select('id, ai_insights')
      .eq('id', assessmentId)
      .maybeSingle();

    if (checkError) {
      console.error('🔍 ERROR CHECKING ASSESSMENT EXISTENCE:', checkError);
      throw new Error('Failed to verify assessment exists before saving insights');
    }

    if (!existingAssessment) {
      console.error('🔍 ASSESSMENT RECORD NOT FOUND - Cannot save insights to non-existent assessment');
      throw new Error('Assessment record not found - cannot save insights');
    }

    // For non-test assessments, if insights already exist, don't overwrite them
    if (!isTestAssessment && existingAssessment.ai_insights && existingAssessment.ai_insights.trim() !== '') {
      console.log('🔍 EXISTING INSIGHTS FOUND FOR NON-TEST ASSESSMENT - ABORTING save to prevent overwrite');
      return; // Don't throw error, just return without saving
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
  } catch (error) {
    console.error('🔍 UNEXPECTED ERROR IN saveInsights:', error);
    throw error; // Re-throw to be handled by the main function
  }
};
