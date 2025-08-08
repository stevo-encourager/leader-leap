import { supabase } from '@/integrations/supabase/client';
import { ActionPlan, ActionPlanFormData, HighGapCompetency } from '@/types/actionPlan';
import { Category } from '@/utils/assessmentTypes';

// Get high-gap competencies from assessment data
export const getHighGapCompetencies = (categories: Category[]): HighGapCompetency[] => {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }

  const competenciesWithGaps = categories.map(category => {
    if (!category.skills || category.skills.length === 0) {
      return { title: category.title, gap: 0, skills: [] };
    }

    const validSkills = category.skills.filter(skill => 
      skill && skill.ratings && 
      typeof skill.ratings.current === 'number' && 
      typeof skill.ratings.desired === 'number'
    );

    if (validSkills.length === 0) {
      return { title: category.title, gap: 0, skills: [] };
    }

    const currentSum = validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0);
    const desiredSum = validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0);

    const currentAvg = Math.round((currentSum / validSkills.length) * 10) / 10;
    const desiredAvg = Math.round((desiredSum / validSkills.length) * 10) / 10;
    const gap = Math.round((desiredAvg - currentAvg) * 10) / 10;

    const skills = validSkills.map(skill => ({
      name: skill.name,
      gap: Math.round((skill.ratings.desired - skill.ratings.current) * 10) / 10
    }));

    return { title: category.title, gap, skills };
  });

  // Sort by gap descending and return top 3
  return competenciesWithGaps
    .filter(comp => comp.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);
};

// Get default resources for a competency
export const getDefaultResources = (competencyName: string) => {
  const resourceMap: { [key: string]: Array<{ type: 'book' | 'framework' | 'tool'; title: string; description?: string; url?: string }> } = {
    'Time/Priority Management': [
      { type: 'book', title: 'Getting Things Done', description: 'David Allen\'s productivity system', url: 'https://amazon.com' },
      { type: 'framework', title: 'Eisenhower Matrix', description: 'Priority decision framework' },
      { type: 'tool', title: 'Time Blocking', description: 'Calendar-based time management technique' }
    ],
    'Strategic Thinking/Vision': [
      { type: 'book', title: 'Good to Great', description: 'Jim Collins on strategic leadership', url: 'https://amazon.com' },
      { type: 'framework', title: 'SWOT Analysis', description: 'Strategic planning framework' },
      { type: 'tool', title: 'Vision Board', description: 'Visual strategic planning tool' }
    ],
    'Team Leadership': [
      { type: 'book', title: 'The Five Dysfunctions of a Team', description: 'Patrick Lencioni on team building', url: 'https://amazon.com' },
      { type: 'framework', title: 'Tuckman Model', description: 'Team development stages' },
      { type: 'tool', title: 'Team Charter', description: 'Team alignment and goal setting' }
    ],
    'Emotional Intelligence': [
      { type: 'book', title: 'Emotional Intelligence 2.0', description: 'Travis Bradberry on EQ development', url: 'https://amazon.com' },
      { type: 'framework', title: 'RULER Framework', description: 'Emotional intelligence model' },
      { type: 'tool', title: 'Emotional Journaling', description: 'Self-awareness development tool' }
    ],
    'Decision Making': [
      { type: 'book', title: 'Thinking, Fast and Slow', description: 'Daniel Kahneman on decision making', url: 'https://amazon.com' },
      { type: 'framework', title: 'Decision Matrix', description: 'Structured decision-making framework' },
      { type: 'tool', title: 'Pro-Con Analysis', description: 'Simple decision evaluation tool' }
    ],
    'Change Management': [
      { type: 'book', title: 'Leading Change', description: 'John Kotter\'s change model', url: 'https://amazon.com' },
      { type: 'framework', title: 'ADKAR Model', description: 'Change management framework' },
      { type: 'tool', title: 'Change Readiness Assessment', description: 'Organizational change evaluation' }
    ],
    'Influencing': [
      { type: 'book', title: 'Influence: The Psychology of Persuasion', description: 'Robert Cialdini on influence', url: 'https://amazon.com' },
      { type: 'framework', title: 'Cialdini\'s 6 Principles', description: 'Influence and persuasion framework' },
      { type: 'tool', title: 'Stakeholder Mapping', description: 'Influence network analysis' }
    ],
    'Negotiation/Conflict Resolution': [
      { type: 'book', title: 'Getting to Yes', description: 'Roger Fisher on principled negotiation', url: 'https://amazon.com' },
      { type: 'framework', title: 'Interest-Based Negotiation', description: 'Win-win negotiation approach' },
      { type: 'tool', title: 'Conflict Resolution Model', description: 'Structured conflict resolution' }
    ],
    'Delegation/Empowerment': [
      { type: 'book', title: 'The One Minute Manager', description: 'Ken Blanchard on delegation', url: 'https://amazon.com' },
      { type: 'framework', title: 'Situational Leadership', description: 'Adaptive leadership framework' },
      { type: 'tool', title: 'Delegation Matrix', description: 'Task delegation planning tool' }
    ],
    'Self-Leadership': [
      { type: 'book', title: 'The 7 Habits of Highly Effective People', description: 'Stephen Covey on personal leadership', url: 'https://amazon.com' },
      { type: 'framework', title: 'Personal Development Plan', description: 'Self-leadership framework' },
      { type: 'tool', title: 'Reflection Journal', description: 'Self-awareness and growth tool' }
    ]
  };

  return resourceMap[competencyName] || [
    { type: 'book', title: 'Leadership Development', description: 'General leadership resource' },
    { type: 'framework', title: 'Goal Setting Framework', description: 'Structured goal achievement' },
    { type: 'tool', title: 'Progress Tracking', description: 'Development monitoring tool' }
  ];
};

// Create initial action plan data
export const createInitialActionPlanData = (competency: HighGapCompetency): ActionPlanFormData => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  const uniquePrefix = `${competency.title}-${timestamp}-${randomSuffix}`;
  
  const defaultResources = getDefaultResources(competency.title).map((resource, index) => ({
    id: `${uniquePrefix}-resource-${index}`,
    ...resource,
    completed: false,
    inUse: false
  }));

  return {
    competency_name: competency.title,
    gap_score: competency.gap,
    goals: [
      { id: `${uniquePrefix}-goal-1`, text: '', targetDate: '', completed: false },
      { id: `${uniquePrefix}-goal-2`, text: '', targetDate: '', completed: false },
      { id: `${uniquePrefix}-goal-3`, text: '', targetDate: '', completed: false }
    ],
    quarterly_milestones: {
      q1: { id: `${uniquePrefix}-milestone-q1`, text: '', targetDate: '', completed: false },
      q2: { id: `${uniquePrefix}-milestone-q2`, text: '', targetDate: '', completed: false }
    },
    plan_text: '',
    actions_text: '',
    resources: defaultResources
  };
};

// Calculate progress percentage
export const calculateProgress = (goals: any[], milestones: any): number => {
  const totalItems = goals.length + Object.keys(milestones).length;
  if (totalItems === 0) return 0;

  const completedGoals = goals.filter(goal => goal.completed).length;
  const completedMilestones = Object.values(milestones).filter((milestone: any) => milestone.completed).length;
  
  return Math.round(((completedGoals + completedMilestones) / totalItems) * 100);
};

// Fetch action plans for a user and assessment
export const fetchActionPlans = async (userId: string, assessmentId: string): Promise<{
  success: boolean;
  data?: ActionPlan[];
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('assessment_id', assessmentId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as unknown as ActionPlan[]) || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch action plans' };
  }
};

// Create or update action plan
export const saveActionPlan = async (
  userId: string,
  assessmentId: string,
  planData: ActionPlanFormData
): Promise<{
  success: boolean;
  data?: ActionPlan;
  error?: string;
}> => {
  try {
    const progress = calculateProgress(planData.goals, planData.quarterly_milestones);

    // First check if a plan already exists
    const { data: existingPlan, error: checkError } = await supabase
      .from('action_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('assessment_id', assessmentId)
      .eq('competency_name', planData.competency_name)
      .maybeSingle();

    let result;
    if (existingPlan) {
      // Update existing plan
      const { data, error } = await supabase
        .from('action_plans')
        .update({
          skill_name: planData.skill_name,
          gap_score: planData.gap_score,
          goals: planData.goals,
          quarterly_milestones: planData.quarterly_milestones,
          plan_text: planData.plan_text,
          actions_text: planData.actions_text,
          resources: planData.resources,
          overall_progress: progress
        })
        .eq('id', existingPlan.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Insert new plan
      const { data, error } = await supabase
        .from('action_plans')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          competency_name: planData.competency_name,
          skill_name: planData.skill_name,
          gap_score: planData.gap_score,
          goals: planData.goals,
          quarterly_milestones: planData.quarterly_milestones,
          plan_text: planData.plan_text,
          actions_text: planData.actions_text,
          resources: planData.resources,
          overall_progress: progress
        })
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, data: result.data as unknown as ActionPlan };
  } catch (error) {
    return { success: false, error: 'Failed to save action plan' };
  }
};

// Update action plan status
export const updateActionPlanStatus = async (
  planId: string,
  status: 'active' | 'archived' | 'completed'
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from('action_plans')
      .update({ status })
      .eq('id', planId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update action plan status' };
  }
};

// Delete action plan
export const deleteActionPlan = async (planId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase
      .from('action_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete action plan' };
  }
}; 