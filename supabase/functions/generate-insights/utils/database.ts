
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

export const checkExistingInsights = async (
  assessmentId: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string,
  forceRegenerate: boolean = false
): Promise<string | null> => {
  console.log('🔍 DATABASE: Checking for existing insights:', {
    assessmentId,
    forceRegenerate
  });

  // CRITICAL FIX: If forceRegenerate is true, always return null to generate new insights
  if (forceRegenerate) {
    console.log('🔍 DATABASE: forceRegenerate=true - Skipping existing insights check');
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: assessment, error } = await supabase
      .from('assessment_results')
      .select('ai_insights')
      .eq('id', assessmentId)
      .single();

    if (error) {
      console.log('🔍 DATABASE: Error checking for existing insights:', error);
      return null;
    }

    if (assessment && 
        assessment.ai_insights && 
        assessment.ai_insights.trim() !== '' &&
        assessment.ai_insights.trim() !== 'null' &&
        assessment.ai_insights.trim() !== 'undefined') {
      
      console.log('🔍 DATABASE: Found existing insights, returning saved version');
      return assessment.ai_insights;
    }

    console.log('🔍 DATABASE: No existing insights found - generating new insights');
    return null;
    
  } catch (error) {
    console.error('🔍 DATABASE: Error in checkExistingInsights:', error);
    return null;
  }
};

export const saveInsights = async (
  assessmentId: string, 
  insights: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
): Promise<void> => {
  console.log('🔍 DATABASE: Saving insights for assessment:', assessmentId);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('assessment_results')
      .update({ ai_insights: insights })
      .eq('id', assessmentId);

    if (error) {
      console.error('🔍 DATABASE: Error saving insights:', error);
      throw new Error(`Failed to save insights: ${error.message}`);
    }

    console.log('🔍 DATABASE: Successfully saved insights');
  } catch (error) {
    console.error('🔍 DATABASE: Error in saveInsights:', error);
    throw error;
  }
};
