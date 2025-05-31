
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const checkExistingInsights = async (assessmentId: string, supabaseUrl: string, supabaseServiceKey: string): Promise<string | null> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('Checking for existing insights for assessment:', assessmentId);
  
  const { data: existingAssessment, error: fetchError } = await supabase
    .from('assessment_results')
    .select('ai_insights')
    .eq('id', assessmentId)
    .single();

  if (fetchError) {
    console.error('Error fetching existing assessment:', fetchError);
    throw new Error('Could not check for existing insights');
  }

  if (existingAssessment && existingAssessment.ai_insights && existingAssessment.ai_insights.trim()) {
    console.log('Found existing insights, returning saved version - NEVER regenerating');
    return existingAssessment.ai_insights;
  }

  return null;
};

export const saveInsights = async (
  assessmentId: string, 
  insights: string, 
  supabaseUrl: string, 
  supabaseServiceKey: string
): Promise<void> => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('Saving NEW insights with enhanced formatted summary to assessment (will NEVER be regenerated):', assessmentId);
  
  const { error: updateError } = await supabase
    .from('assessment_results')
    .update({ ai_insights: insights })
    .eq('id', assessmentId);

  if (updateError) {
    console.error('Error saving insights to database:', updateError);
    throw new Error('Failed to save insights to database');
  } else {
    console.log('Successfully saved enhanced formatted insights to database - will be reused forever');
  }
};
