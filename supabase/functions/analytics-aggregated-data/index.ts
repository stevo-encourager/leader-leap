import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsData {
  competencyAverages: {
    [competencyId: string]: {
      title: string;
      avgCurrent: number;
      avgDesired: number;
      avgGap: number;
      assessmentCount: number;
    }
  };
  skillGaps: {
    [skillId: string]: {
      name: string;
      categoryTitle: string;
      avgCurrent: number;
      avgDesired: number;
      avgGap: number;
      assessmentCount: number;
    }
  };
  demographicTrends: {
    byRole: { [role: string]: { avgGap: number; count: number } };
    byExperience: { [level: string]: { avgGap: number; count: number } };
    byIndustry: { [industry: string]: { avgGap: number; count: number } };
  };
  assessmentTrends: {
    monthlyCompletions: { [month: string]: number };
    completionRate: number;
    averageAssessmentTime: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- JWT & Admin Check ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }
  const jwt = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${jwt}` } } });

  // Get user info from JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  // Check is_admin in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (profileError || !profile?.is_admin) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // --- Analytics logic ---
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    // Get all completed assessments
    const { data: assessments, error: assessmentsError } = await supabaseAdmin
      .from('assessment_results')
      .select('categories, demographics, created_at, completed')
      .eq('completed', true);

    if (assessmentsError) {
      console.error("Error fetching assessments:", assessmentsError);
      return new Response(
        JSON.stringify({ success: false, error: assessmentsError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!assessments || assessments.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            competencyAverages: {},
            skillGaps: {},
            demographicTrends: { byRole: {}, byExperience: {}, byIndustry: {} },
            assessmentTrends: { monthlyCompletions: {}, completionRate: 0, averageAssessmentTime: 0 }
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Process analytics data
    const analyticsData = processAnalyticsData(assessments);

    return new Response(
      JSON.stringify({ success: true, data: analyticsData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in analytics function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function processAnalyticsData(assessments: any[]): AnalyticsData {
  const competencyAverages: { [key: string]: any } = {};
  const skillGaps: { [key: string]: any } = {};
  const demographicTrends = {
    byRole: {} as { [role: string]: { avgGap: number; count: number } },
    byExperience: {} as { [level: string]: { avgGap: number; count: number } },
    byIndustry: {} as { [industry: string]: { avgGap: number; count: number } }
  };

  // Process each assessment
  assessments.forEach(assessment => {
    const categories = assessment.categories || [];
    const demographics = assessment.demographics || {};

    // Process categories and skills
    categories.forEach((category: any) => {
      if (!category || !category.skills) return;

      const categoryId = category.id || category.title;
      const categoryTitle = category.title || category.name;

      // Initialize category data if not exists
      if (!competencyAverages[categoryId]) {
        competencyAverages[categoryId] = {
          title: categoryTitle,
          totalCurrent: 0,
          totalDesired: 0,
          skillCount: 0,
          assessmentCount: 0
        };
      }

      let categoryCurrentSum = 0;
      let categoryDesiredSum = 0;
      let validSkillsInCategory = 0;

      // Process skills in this category
      category.skills.forEach((skill: any) => {
        if (!skill || !skill.ratings) return;

        const skillId = skill.id || skill.name;
        const skillName = skill.name || skill.title;
        const current = Number(skill.ratings.current) || 0;
        const desired = Number(skill.ratings.desired) || 0;

        // Only process skills with valid ratings
        if (current > 0 || desired > 0) {
          const gap = Math.abs(desired - current);

          // Initialize skill data if not exists
          if (!skillGaps[skillId]) {
            skillGaps[skillId] = {
              name: skillName,
              categoryTitle: categoryTitle,
              totalCurrent: 0,
              totalDesired: 0,
              totalGap: 0,
              assessmentCount: 0
            };
          }

          // Accumulate skill data
          skillGaps[skillId].totalCurrent += current;
          skillGaps[skillId].totalDesired += desired;
          skillGaps[skillId].totalGap += gap;
          skillGaps[skillId].assessmentCount++;

          // Accumulate category data
          categoryCurrentSum += current;
          categoryDesiredSum += desired;
          validSkillsInCategory++;
        }
      });

      // Update category averages if we have valid skills
      if (validSkillsInCategory > 0) {
        competencyAverages[categoryId].totalCurrent += categoryCurrentSum;
        competencyAverages[categoryId].totalDesired += categoryDesiredSum;
        competencyAverages[categoryId].skillCount += validSkillsInCategory;
        competencyAverages[categoryId].assessmentCount++;
      }
    });

    // Process demographics
    const role = demographics.role;
    const experience = demographics.yearsOfExperience;
    const industry = demographics.industry;

    if (role) {
      if (!demographicTrends.byRole[role]) {
        demographicTrends.byRole[role] = { avgGap: 0, count: 0, totalGap: 0 };
      }
      demographicTrends.byRole[role].count++;
      // Calculate average gap for this assessment
      const assessmentGap = calculateAssessmentGap(categories);
      demographicTrends.byRole[role].totalGap += assessmentGap;
    }

    if (experience) {
      if (!demographicTrends.byExperience[experience]) {
        demographicTrends.byExperience[experience] = { avgGap: 0, count: 0, totalGap: 0 };
      }
      demographicTrends.byExperience[experience].count++;
      const assessmentGap = calculateAssessmentGap(categories);
      demographicTrends.byExperience[experience].totalGap += assessmentGap;
    }

    if (industry) {
      if (!demographicTrends.byIndustry[industry]) {
        demographicTrends.byIndustry[industry] = { avgGap: 0, count: 0, totalGap: 0 };
      }
      demographicTrends.byIndustry[industry].count++;
      const assessmentGap = calculateAssessmentGap(categories);
      demographicTrends.byIndustry[industry].totalGap += assessmentGap;
    }
  });

  // Calculate final averages
  Object.keys(competencyAverages).forEach(categoryId => {
    const category = competencyAverages[categoryId];
    if (category.assessmentCount > 0) {
      category.avgCurrent = Math.round((category.totalCurrent / category.skillCount) * 100) / 100;
      category.avgDesired = Math.round((category.totalDesired / category.skillCount) * 100) / 100;
      category.avgGap = Math.round(Math.abs(category.avgDesired - category.avgCurrent) * 100) / 100;
    }
    delete category.totalCurrent;
    delete category.totalDesired;
    delete category.skillCount;
  });

  Object.keys(skillGaps).forEach(skillId => {
    const skill = skillGaps[skillId];
    if (skill.assessmentCount > 0) {
      skill.avgCurrent = Math.round((skill.totalCurrent / skill.assessmentCount) * 100) / 100;
      skill.avgDesired = Math.round((skill.totalDesired / skill.assessmentCount) * 100) / 100;
      skill.avgGap = Math.round((skill.totalGap / skill.assessmentCount) * 100) / 100;
    }
    delete skill.totalCurrent;
    delete skill.totalDesired;
    delete skill.totalGap;
  });

  // Calculate demographic averages
  Object.keys(demographicTrends.byRole).forEach(role => {
    const data = demographicTrends.byRole[role];
    data.avgGap = Math.round((data.totalGap / data.count) * 100) / 100;
    delete data.totalGap;
  });

  Object.keys(demographicTrends.byExperience).forEach(experience => {
    const data = demographicTrends.byExperience[experience];
    data.avgGap = Math.round((data.totalGap / data.count) * 100) / 100;
    delete data.totalGap;
  });

  Object.keys(demographicTrends.byIndustry).forEach(industry => {
    const data = demographicTrends.byIndustry[industry];
    data.avgGap = Math.round((data.totalGap / data.count) * 100) / 100;
    delete data.totalGap;
  });

  // Calculate assessment trends
  const assessmentTrends = calculateAssessmentTrends(assessments);

  return {
    competencyAverages,
    skillGaps,
    demographicTrends,
    assessmentTrends
  };
}

function calculateAssessmentGap(categories: any[]): number {
  let totalGap = 0;
  let validSkills = 0;

  categories.forEach(category => {
    if (!category || !category.skills) return;

    category.skills.forEach((skill: any) => {
      if (!skill || !skill.ratings) return;

      const current = Number(skill.ratings.current) || 0;
      const desired = Number(skill.ratings.desired) || 0;

      if (current > 0 || desired > 0) {
        totalGap += Math.abs(desired - current);
        validSkills++;
      }
    });
  });

  return validSkills > 0 ? totalGap / validSkills : 0;
}

function calculateAssessmentTrends(assessments: any[]): any {
  const monthlyCompletions: { [month: string]: number } = {};
  let totalAssessments = assessments.length;
  let completedAssessments = assessments.filter(a => a.completed).length;

  // Calculate monthly completions
  assessments.forEach(assessment => {
    if (assessment.created_at) {
      const date = new Date(assessment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCompletions[monthKey] = (monthlyCompletions[monthKey] || 0) + 1;
    }
  });

  return {
    monthlyCompletions,
    completionRate: totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0,
    averageAssessmentTime: 0 // Could be calculated if we track assessment duration
  };
} 