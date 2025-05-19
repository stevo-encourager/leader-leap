
import { supabase } from '@/integrations/supabase/client';
import { Category, Demographics } from '@/utils/assessmentData';
import { Json } from '@/integrations/supabase/types';

export const saveAssessmentResults = async (categories: Category[], demographics: Demographics) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('assessment_results')
      .insert([{  // Fixed: Wrapped the object in an array
        user_id: session.session.user.id,
        categories: categories as unknown as Json,
        demographics: demographics as unknown as Json
      }]);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error saving assessment results:', error);
    return { success: false, error: error.message };
  }
};

export const getLatestAssessmentResults = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session.session?.user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', session.session.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    return { 
      success: true, 
      data: {
        categories: data.categories as unknown as Category[],
        demographics: data.demographics as unknown as Demographics,
        created_at: data.created_at
      }
    };
  } catch (error: any) {
    console.error('Error getting assessment results:', error);
    return { success: false, error: error.message };
  }
};
