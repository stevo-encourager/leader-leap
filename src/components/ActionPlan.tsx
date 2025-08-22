import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronUp, Save, Plus, Archive, CheckCircle, Trash2, ExternalLink, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  ActionPlan, 
  ActionPlanFormData, 
  HighGapCompetency,
  ActionPlanGoal,
  ActionPlanMilestone,
  ActionPlanResource
} from '@/types/actionPlan';
import {
  getHighGapCompetencies,
  createInitialActionPlanData,
  fetchActionPlans,
  saveActionPlan,
  updateActionPlanStatus,
  deleteActionPlan,
  calculateProgress
} from '@/services/actionPlan';
import { Category } from '@/utils/assessmentTypes';
import { fetchLatestAssessmentByUserId, fetchAssessmentByIdAndUserId } from '@/services/assessment/fetchAssessment';
import { supabase } from '@/integrations/supabase/client';
import { pdf } from '@react-pdf/renderer';
import ActionPlanSummaryPDF from './pdf/ActionPlanSummaryPDF';

interface ActionPlanProps {
  assessments: Array<{
    id: string;
    created_at: string;
  }>;
}

const ActionPlanComponent: React.FC<ActionPlanProps> = ({ assessments }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Competency descriptions for tooltips
  const competencyDescriptions: { [key: string]: string } = {
    'Strategic Thinking/Vision': 'The ability to develop a clear vision and identify opportunities for growth and innovation.',
    'Influencing': 'Connecting with any audience to inform, persuade, and inspire action',
    'Team Leadership': 'The ability to build and maintain high-performing teams through effective leadership.',
    'Decision Making': 'The ability to make timely and effective decisions based on available information.',
    'Emotional Intelligence': 'The ability to recognize and manage emotions in yourself and others.',
    'Change Management': 'The ability to effectively lead and support organisational change initiatives.',
    'Negotiation & Conflict Resolution': 'The ability to resolve conflicts and negotiate effectively with stakeholders.',
    'Delegation & Empowerment': 'The ability to effectively assign responsibilities and empower team members.',
    'Time/Priority Management': 'The ability to manage time effectively and prioritize tasks appropriately.',
    'Self-Leadership': 'The ability to continuously improve skills and knowledge for career growth.'
  };
  
  // Skill descriptions for tooltips
  const skillDescriptions: { [key: string]: string } = {
    // Strategic Thinking/Vision
    'Future Vision': 'Ability to envision and articulate a compelling future state for the organisation.',
    'Big Picture Thinking': 'Ability to see beyond day-to-day operations and understand broader implications.',
    'Strategic Planning': 'Ability to create actionable plans that align with the organisation\'s vision.',
    
    // Influencing
    'Persuasive Messaging': 'The ability to craft compelling arguments (verbal, written and visual) that motivate others to adopt new perspectives or take specific actions',
    'Stakeholder Engagement': 'The ability to identify key decision-makers and tailor communication strategies to gain their support and buy-in',
    'Executive Presence': 'The ability to project confidence and credibility while delivering messages that inspire trust and drive behavioral change',
    
    // Team Leadership
    'Team Motivation': 'Ability to inspire and drive team members toward common goals.',
    'Team Development': 'Ability to identify and nurture team member strengths and address weaknesses.',
    'Collaboration': 'Ability to foster cooperation and effective working relationships.',
    
    // Decision Making
    'Critical Thinking': 'Ability to analyze situations objectively and evaluate options thoroughly.',
    'Problem Solving': 'Ability to identify issues and implement effective solutions.',
    'Decisiveness': 'Ability to make decisions in a timely manner, even with limited information.',
    
    // Emotional Intelligence
    'Self-Awareness': 'Ability to recognize your own emotions and their impact on thoughts and behavior.',
    'Empathy': 'Ability to understand and share the feelings of others.',
    'Relationship Management': 'Ability to develop and maintain healthy professional relationships, managing up as well as down.',
    
    // Change Management
    'Adaptability': 'Ability to adjust to new conditions and embrace change.',
    'Change Leadership': 'Ability to guide teams through transitions and transformations.',
    'Resilience': 'Ability to recover quickly from difficulties and setbacks.',
    
    // Negotiation & Conflict Resolution
    'Conflict Resolution': 'Ability to identify and resolve conflicts effectively.',
    'Strategic Negotiation': 'Ability to negotiate win-win outcomes in complex situations.',
    'Facilitation & Mediation': 'Ability to facilitate discussions and mediate disputes between parties.',
    
    // Delegation & Empowerment
    'Task Delegation': 'Ability to assign work appropriately based on skills and development needs.',
    'Trust Building': 'Ability to create an environment of mutual trust and respect.',
    'Autonomy Support': 'Ability to provide independence while maintaining appropriate oversight.',
    
    // Time/Priority Management
    'Time Management': 'Ability to organize and prioritize tasks effectively.',
    'Prioritization': 'Ability to identify and focus on the most important tasks.',
    'Productivity': 'Ability to maintain high levels of output and efficiency.',
    
    // Self-Leadership
    'Continuous Learning': 'Ability to seek out and absorb new knowledge and skills.',
    'Feedback Reception': 'Ability to receive and implement constructive feedback effectively.',
    'Career Planning': 'Ability to set and work toward meaningful professional goals.'
  };
  
  // State management
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [selectedAssessmentData, setSelectedAssessmentData] = useState<{ categories: Category[] } | null>(null);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [expandedCompetencies, setExpandedCompetencies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [planData, setPlanData] = useState<Map<string, ActionPlanFormData>>(new Map());
  const [tooltipStates, setTooltipStates] = useState<{ [key: string]: boolean }>({});

  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Initialize with most recent assessment
  useEffect(() => {
    if (assessments.length > 0) {
      setSelectedAssessmentId(assessments[0].id);
    }
  }, [assessments]);

  // Load assessment data when selection changes
  useEffect(() => {
    if (selectedAssessmentId && user) {
      loadAssessmentData(selectedAssessmentId);
      loadActionPlans(selectedAssessmentId);
      loadAiInsights(selectedAssessmentId);
    }
  }, [selectedAssessmentId, user]);



  const loadAssessmentData = async (assessmentId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await fetchAssessmentByIdAndUserId(assessmentId, user.id);
      if (result.success && result.data) {
        setSelectedAssessmentData({ categories: result.data.categories });
      }
    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActionPlans = async (assessmentId: string) => {
    if (!user) return;
    
    try {
      const result = await fetchActionPlans(user.id, assessmentId);
      if (result.success && result.data) {
        setActionPlans(result.data);
        
        // Initialize plan data for existing plans
        const newPlanData = new Map();
        result.data.forEach(plan => {
          // Ensure unique IDs for goals and milestones to prevent React key conflicts
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substr(2, 9);
          const uniquePrefix = `${plan.competency_name}-${timestamp}-${randomSuffix}`;
          
          // Update goals with unique IDs
          const updatedGoals = plan.goals.map((goal: any, index: number) => ({
            ...goal,
            id: goal.id && goal.id.includes('goal-') ? `${uniquePrefix}-goal-${index + 1}` : goal.id
          }));
          
          // Update milestones with unique IDs
          const updatedMilestones = {
            q1: {
              ...plan.quarterly_milestones.q1,
              id: plan.quarterly_milestones.q1.id && plan.quarterly_milestones.q1.id.includes('milestone-') 
                ? `${uniquePrefix}-milestone-q1` 
                : plan.quarterly_milestones.q1.id
            },
            q2: {
              ...plan.quarterly_milestones.q2,
              id: plan.quarterly_milestones.q2.id && plan.quarterly_milestones.q2.id.includes('milestone-') 
                ? `${uniquePrefix}-milestone-q2` 
                : plan.quarterly_milestones.q2.id
            }
          };
          
          // Update resources with unique IDs
          const updatedResources = plan.resources.map((resource: any, index: number) => ({
            ...resource,
            id: resource.id && resource.id.includes('resource-') ? `${uniquePrefix}-resource-${index}` : resource.id
          }));
          
          newPlanData.set(plan.competency_name, {
            competency_name: plan.competency_name,
            skill_name: plan.skill_name,
            gap_score: plan.gap_score,
            goals: updatedGoals,
            quarterly_milestones: updatedMilestones,
            plan_text: plan.plan_text,
            actions_text: plan.actions_text,
            resources: updatedResources
          });
        });
        setPlanData(newPlanData);
      }
    } catch (error) {
      console.error('Error loading action plans:', error);
    }
  };

  // Load AI insights for the selected assessment
  const loadAiInsights = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('ai_insights')
        .eq('id', assessmentId)
        .maybeSingle();

      if (error) {
        console.error('Error loading AI insights:', error);
        return;
      }

      if (data && (data as any).ai_insights) {
        setAiInsights((data as any).ai_insights);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  // Parse resources from AI insights data
  const parseResourcesFromInsights = (competencyName: string): Array<{ id: string; title: string; url: string; type: 'book' | 'framework' | 'tool'; description?: string; completed: boolean; inUse: boolean }> => {
    if (!aiInsights) return [];

    try {
      const parsed = JSON.parse(aiInsights);
      
      // Look for resources in priority_areas (development areas)
      if (parsed.priority_areas && Array.isArray(parsed.priority_areas)) {
        const priorityArea = parsed.priority_areas.find((area: any) => 
          area.competency && area.competency.toLowerCase().includes(competencyName.toLowerCase())
        );
        
        if (priorityArea && priorityArea.resources && Array.isArray(priorityArea.resources)) {
          return priorityArea.resources.map((resource: string, index: number) => {
            // Parse markdown format [Name](url)
            const markdownMatch = resource.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (markdownMatch) {
              const name = markdownMatch[1];
              const url = markdownMatch[2];
              return {
                id: `resource-${index}`,
                title: name,
                url: url,
                type: 'tool' as const,
                description: `Recommended resource for ${competencyName}`,
                completed: false,
                inUse: false
              };
            }
            return null;
          }).filter(Boolean);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing AI insights:', error);
      return [];
    }
  };

  const getHighGapCompetenciesForAssessment = (): HighGapCompetency[] => {
    if (!selectedAssessmentData?.categories) return [];
    return getHighGapCompetencies(selectedAssessmentData.categories);
  };

  const toggleCompetencyExpansion = (competencyName: string) => {
    const newExpanded = new Set(expandedCompetencies);
    if (newExpanded.has(competencyName)) {
      newExpanded.delete(competencyName);
    } else {
      newExpanded.add(competencyName);
    }
    setExpandedCompetencies(newExpanded);
  };

  const createActionPlan = (competency: HighGapCompetency) => {
    // Get resources from AI insights if available, otherwise use default
    const aiResources = parseResourcesFromInsights(competency.title);
    const resources = aiResources.length > 0 ? aiResources : createInitialActionPlanData(competency).resources;
    
    const initialData = {
      ...createInitialActionPlanData(competency),
      resources: resources
    };
    
    setPlanData(prev => new Map(prev).set(competency.title, initialData));
    setExpandedCompetencies(prev => new Set(prev).add(competency.title));
    // Don't mark as unsaved until there's actual content
  };

  const updatePlanData = (competencyName: string, updates: Partial<ActionPlanFormData>) => {
    setPlanData(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(competencyName) || createInitialActionPlanData({ title: competencyName, gap: 0, skills: [] });
      newMap.set(competencyName, { ...current, ...updates });
      return newMap;
    });
    
    // Mark as having unsaved changes
    setUnsavedChanges(prev => new Set(prev).add(competencyName));
    
    // Auto-save disabled to prevent database errors
  };

  const updateGoal = (competencyName: string, goalId: string, updates: Partial<ActionPlanGoal>) => {
    const currentPlan = planData.get(competencyName);
    if (!currentPlan) return;

    const updatedGoals = currentPlan.goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    
    updatePlanData(competencyName, { goals: updatedGoals });
    // Auto-save disabled to prevent database errors
  };

  const updateMilestone = (competencyName: string, milestoneKey: 'q1' | 'q2', updates: Partial<ActionPlanMilestone>) => {
    const currentPlan = planData.get(competencyName);
    if (!currentPlan) return;

    const updatedMilestones = {
      ...currentPlan.quarterly_milestones,
      [milestoneKey]: { ...currentPlan.quarterly_milestones[milestoneKey], ...updates }
    };
    
    updatePlanData(competencyName, { quarterly_milestones: updatedMilestones });
    // Auto-save disabled to prevent database errors
  };

  const updateResource = (competencyName: string, resourceId: string, updates: Partial<ActionPlanResource>) => {
    const currentPlan = planData.get(competencyName);
    if (!currentPlan) return;

    const updatedResources = currentPlan.resources.map(resource => 
      resource.id === resourceId ? { ...resource, ...updates } : resource
    );
    
    updatePlanData(competencyName, { resources: updatedResources });
    // Auto-save disabled to prevent database errors
  };



  const savePlan = async (competencyName: string) => {
    if (!user || !selectedAssessmentId) return;

    const plan = planData.get(competencyName);
    if (!plan) return;

    setSaving(prev => new Set(prev).add(competencyName));
    
    try {
      const result = await saveActionPlan(user.id, selectedAssessmentId, plan);
      if (result.success) {
        // Clear unsaved changes
        setUnsavedChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(competencyName);
          return newSet;
        });
        // Reload action plans to get updated data
        await loadActionPlans(selectedAssessmentId);
      } else {
        toast({
          title: "Save failed",
          description: result.error || "Failed to save action plan",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "An error occurred while saving",
        variant: "destructive"
      });
    } finally {
      setSaving(prev => {
        const newSet = new Set(prev);
        newSet.delete(competencyName);
        return newSet;
      });
    }
  };

  const updatePlanStatus = async (planId: string, status: 'active' | 'archived' | 'completed') => {
    try {
      const result = await updateActionPlanStatus(planId, status);
      if (result.success) {
        toast({
          title: "Status updated",
          description: `Action plan marked as ${status}.`
        });
        await loadActionPlans(selectedAssessmentId);
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating status",
        variant: "destructive"
      });
    }
  };

  const deletePlan = async (planId: string, competencyName: string) => {
    try {
      const result = await deleteActionPlan(planId);
      if (result.success) {
        toast({
          title: "Action plan deleted",
          description: `Action plan for ${competencyName} has been deleted.`
        });
        await loadActionPlans(selectedAssessmentId);
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Failed to delete action plan",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting",
        variant: "destructive"
      });
    }
  };

  const getProgressForPlan = (competencyName: string): number => {
    const plan = planData.get(competencyName);
    if (!plan) return 0;
    return calculateProgress(plan.goals, plan.quarterly_milestones);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display in summary tables
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    
    // If it's already in DD/MM/YYYY format, return as-is
    if (dateString.includes('/')) return dateString;
    
    // If it's in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    
    return dateString;
  };

  // Check if a plan has any meaningful content to save
  const hasPlanContent = (plan: ActionPlanFormData): boolean => {
    // Check if any goals have text
    const hasGoalContent = plan.goals.some(goal => goal.text && goal.text.trim() !== '');
    
    // Check if any milestones have text
    const hasMilestoneContent = Object.values(plan.quarterly_milestones).some(milestone => 
      milestone.text && milestone.text.trim() !== ''
    );
    
    // Check if notes have content
    const hasNotesContent = plan.plan_text && plan.plan_text.trim() !== '';
    
    return hasGoalContent || hasMilestoneContent || hasNotesContent;
  };

  // Get all goals from all competencies for summary
  const getAllGoals = () => {
    const allGoals: Array<{
      id: string;
      description: string;
      competency: string;
      targetDate: string;
      completed: boolean;
    }> = [];

    // Only include goals from competencies that are currently visible in the UI
    // (i.e., from highGapCompetencies) and have action plans
    highGapCompetencies.forEach(competency => {
      const plan = planData.get(competency.title);
      if (plan && plan.goals) {
        plan.goals.forEach(goal => {
          if (goal && goal.text && goal.text.trim()) { // Only include goals with text
            allGoals.push({
              id: goal.id,
              description: goal.text,
              competency: competency.title,
              targetDate: goal.targetDate || '',
              completed: goal.completed || false
            });
          }
        });
      }
    });

    return allGoals;
  };

  // Get all milestones from all competencies for summary
  const getAllMilestones = () => {
    const allMilestones: Array<{
      id: string;
      description: string;
      competency: string;
      targetDate: string;
      completed: boolean;
      quarter: string;
    }> = [];

    // Only include milestones from competencies that are currently visible in the UI
    // (i.e., from highGapCompetencies) and have action plans
    highGapCompetencies.forEach(competency => {
      const plan = planData.get(competency.title);
      if (plan && plan.quarterly_milestones) {
        Object.entries(plan.quarterly_milestones).forEach(([quarter, milestone]) => {
          if (milestone && milestone.text && milestone.text.trim()) { // Only include milestones with text
            allMilestones.push({
              id: milestone.id,
              description: milestone.text,
              competency: competency.title,
              targetDate: milestone.targetDate || '',
              completed: milestone.completed || false,
              quarter: quarter.toUpperCase()
            });
          }
        });
      }
    });

    return allMilestones;
  };

  // Export functions
  const handleExportPDF = async () => {
    const goals = getAllGoals();
    const milestones = getAllMilestones();
    
    if (goals.length === 0 && milestones.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Create some goals or milestones in your action plan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfDoc = (
        <ActionPlanSummaryPDF
          goals={goals}
          milestones={milestones}
          userName={user?.user_metadata?.full_name}
        />
      );
      
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      if (pdfBlob.size === 0) {
        throw new Error('Generated PDF blob is empty');
      }
      
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const ukDateString = `${day}-${month}-${year}`;
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leader-leap-action-plan-summary - ${ukDateString}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Download Successful",
        description: "Your action plan summary has been downloaded as a PDF.",
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "PDF Export Failed",
        description: "There was an error generating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const goals = getAllGoals();
    const milestones = getAllMilestones();
    
    if (goals.length === 0 && milestones.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Create some goals or milestones in your action plan first.",
        variant: "destructive",
      });
      return;
    }

    try {
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add goals section
      csvContent += 'Short Term Goals\n';
      csvContent += 'Goal Description,Target Date,Completed,Competency\n';
      goals.forEach(goal => {
        const description = `"${goal.description.replace(/"/g, '""')}"`;
        const targetDate = formatDateForDisplay(goal.targetDate);
        const completed = goal.completed ? 'Yes' : 'No';
        const competency = `"${goal.competency}"`;
        csvContent += `${description},${targetDate},${completed},${competency}\n`;
      });
      
      // Add empty line between sections
      csvContent += '\n';
      
      // Add milestones section
      csvContent += 'Quarterly Milestones\n';
      csvContent += 'Milestone Description,Target Date,Completed,Competency\n';
      milestones.forEach(milestone => {
        const description = `"${milestone.description.replace(/"/g, '""')}"`;
        const targetDate = formatDateForDisplay(milestone.targetDate);
        const completed = milestone.completed ? 'Yes' : 'No';
        const competency = `"${milestone.competency}"`;
        csvContent += `${description},${targetDate},${completed},${competency}\n`;
      });
      
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const ukDateString = `${day}-${month}-${year}`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `leader-leap-action-plan-summary - ${ukDateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV Download Successful",
        description: "Your action plan summary has been downloaded as a CSV file.",
      });
      
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: "CSV Export Failed",
        description: "There was an error generating your CSV file. Please try again.",
        variant: "destructive",
      });
    }
  };



  // Mobile-only message
  if (isMobile) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-encourager">6-Month Action Plan</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                Log in to desktop to create your full action plan
              </p>
              <p className="text-sm text-slate-500">
                The action plan feature requires a larger screen for the best experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop view
  const highGapCompetencies = getHighGapCompetenciesForAssessment();
  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-encourager">6-Month Action Plan</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-slate-600">Loading action plan data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-encourager">6-Month Action Plan</h2>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-slate-600">Complete an assessment first to create your action plan.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-encourager">6-Month Action Plan</h2>
      
      <div className="bg-encourager/5 p-6 rounded-lg border border-encourager/20">
        {/* Instructions */}
        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-encourager mb-6">
          <p className="text-slate-700 text-sm font-montserrat">
            Complete your short-term goals and quarterly milestones for the three competencies with the largest gaps.
          </p>
          <p className="text-slate-700 text-sm font-montserrat mt-2">
            <strong>Short-term Goals</strong> = specific actions or tasks you'll complete in the next 1-3 months to improve this competency. Think immediate, concrete steps you can take.
          </p>
          <p className="text-slate-700 text-sm font-montserrat mt-2">
            <strong>Quarterly Milestones</strong> = measurable outcomes or achievements that show your progress over a 3-month period. They're bigger-picture results that demonstrate you're actually improving in this area.
          </p>
        </div>

        {/* Assessment Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Label htmlFor="assessment-select" className="text-xl font-bold text-encourager font-montserrat whitespace-nowrap">
            Action Plan for Assessment:
          </Label>
          <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment) => (
                <SelectItem key={assessment.id} value={assessment.id}>
                  {new Date(assessment.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* High Gap Competencies */}
      {highGapCompetencies.length > 0 ? (
        <div className="space-y-4">
          {highGapCompetencies.map((competency) => {
            const existingPlan = actionPlans.find(plan => plan.competency_name === competency.title);
            const isExpanded = expandedCompetencies.has(competency.title);
            const currentPlanData = planData.get(competency.title);
            const progress = getProgressForPlan(competency.title);

            return (
              <Card key={competency.title} className="border border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TooltipProvider>
                          <Tooltip open={tooltipStates[`competency-${competency.title}`]} onOpenChange={(open) => setTooltipStates(prev => ({ ...prev, [`competency-${competency.title}`]: open }))}>
                            <TooltipTrigger asChild>
                              <CardTitle 
                                className="text-lg text-slate-700 font-montserrat font-normal cursor-pointer"
                                onClick={() => setTooltipStates(prev => ({ ...prev, [`competency-${competency.title}`]: !prev[`competency-${competency.title}`] }))}
                              >
                                {competency.title} - Gap: {competency.gap}
                              </CardTitle>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{competencyDescriptions[competency.title] || 'No description available.'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {existingPlan && (
                          <Badge className={getStatusBadgeColor(existingPlan.status)}>
                            {existingPlan.status}
                          </Badge>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mb-3">
                          <h4 className="font-semibold mb-3 text-encourager font-montserrat">Skills Breakdown</h4>
                          <div className="text-sm text-slate-600 mb-2">
                            {competency.skills.map((skill, index) => (
                              <div key={skill.name} className="ml-4 mb-1">
                                <TooltipProvider>
                                  <Tooltip open={tooltipStates[`skill-${skill.name}`]} onOpenChange={(open) => setTooltipStates(prev => ({ ...prev, [`skill-${skill.name}`]: open }))}>
                                    <TooltipTrigger asChild>
                                      <span 
                                        className="cursor-pointer underline decoration-dotted"
                                        onClick={() => setTooltipStates(prev => ({ ...prev, [`skill-${skill.name}`]: !prev[`skill-${skill.name}`] }))}
                                      >
                                        {skill.name}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{skillDescriptions[skill.name] || 'No description available.'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <span className="text-slate-500"> (Gap: {skill.gap})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {existingPlan && (
                        <div className="text-sm text-slate-600">
                          Overall Progress: {progress}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!existingPlan && (
                        <Button
                          size="sm"
                          onClick={() => createActionPlan(competency)}
                          className="bg-encourager hover:bg-encourager-light"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Plan
                        </Button>
                      )}
                      {(existingPlan || (currentPlanData && hasPlanContent(currentPlanData))) && (
                        <Button
                          size="sm"
                          onClick={() => savePlan(competency.title)}
                          disabled={saving.has(competency.title)}
                          className={unsavedChanges.has(competency.title) ? "bg-orange-500 hover:bg-orange-600" : "bg-encourager hover:bg-encourager-light"}
                        >
                          {saving.has(competency.title) ? (
                            <>
                              <Save className="w-4 h-4 mr-1" />
                              Saving...
                            </>
                          ) : unsavedChanges.has(competency.title) ? (
                            <>
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-1" />
                              Saved
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCompetencyExpansion(competency.title)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && currentPlanData && (
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {/* Goals Section */}
                      <div>
                        <h4 className="font-semibold mb-3 text-encourager font-montserrat">Short-term Goals</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-[1fr_120px_80px] gap-3 items-center mb-2">
                            <span className="text-sm font-medium text-slate-600">Goal Description</span>
                            <span className="text-sm font-medium text-slate-600 text-center">Target Date</span>
                            <span className="text-sm font-medium text-slate-600 text-center">Completed</span>
                          </div>
                          {currentPlanData.goals.map((goal, index) => (
                            <div key={goal.id} className="grid grid-cols-[1fr_120px_80px] gap-3 items-center">
                              <Input
                                value={goal.text}
                                onChange={(e) => updateGoal(competency.title, goal.id, { text: e.target.value })}
                                placeholder={`Goal ${index + 1} (200 characters max)`}
                                maxLength={200}
                              />
                              <Input
                                type="date"
                                value={goal.targetDate}
                                onChange={(e) => updateGoal(competency.title, goal.id, { targetDate: e.target.value })}
                                className="[&:not([value])]:text-slate-400"
                              />
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={goal.completed}
                                  onCheckedChange={(checked) => 
                                    updateGoal(competency.title, goal.id, { completed: !!checked })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Quarterly Milestones */}
                      <div>
                        <h4 className="font-semibold mb-3 text-encourager font-montserrat">Quarterly Milestones</h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-[1fr_120px_80px] gap-3 items-center mb-2">
                            <span className="text-sm font-medium text-slate-600">Milestone Description</span>
                            <span className="text-sm font-medium text-slate-600 text-center">Target Date</span>
                            <span className="text-sm font-medium text-slate-600 text-center">Completed</span>
                          </div>
                          {Object.entries(currentPlanData.quarterly_milestones).map(([key, milestone], index) => (
                            <div key={milestone.id} className="grid grid-cols-[1fr_120px_80px] gap-3 items-center">
                              <Input
                                value={milestone.text}
                                onChange={(e) => updateMilestone(competency.title, key as any, { text: e.target.value })}
                                placeholder={`${key === 'q1' ? 'Q1' : 'Q2'} milestone description (200 characters max)`}
                                maxLength={200}
                              />
                              <Input
                                type="date"
                                value={milestone.targetDate}
                                onChange={(e) => updateMilestone(competency.title, key as any, { targetDate: e.target.value })}
                                className="[&:not([value])]:text-slate-400"
                              />
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={milestone.completed}
                                  onCheckedChange={(checked) => 
                                    updateMilestone(competency.title, key as any, { completed: !!checked })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Notes */}
                      <div>
                        <h4 className="font-semibold mb-3 text-encourager font-montserrat">Notes</h4>
                        <div>
                          <Textarea
                            value={currentPlanData.plan_text}
                            onChange={(e) => updatePlanData(competency.title, { plan_text: e.target.value })}
                            placeholder="Your notes and observations (500 characters max)"
                            maxLength={500}
                            rows={5}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Resources */}
                      <div>
                        <h4 className="font-semibold mb-3 text-encourager font-montserrat">Recommended Resources</h4>
                        <div className="bg-slate-50 p-4 rounded border-l-4 border-encourager">
                          <div className="space-y-2">
                            {currentPlanData.resources.map((resource) => (
                              <div key={resource.id}>
                                <a 
                                  href={resource.url || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-encourager hover:text-encourager-light text-sm flex items-center gap-1 underline"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {resource.title}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => savePlan(competency.title)}
                            disabled={saving.has(competency.title)}
                            className="bg-encourager hover:bg-encourager-light"
                          >
                            {saving.has(competency.title) ? (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {existingPlan && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePlanStatus(existingPlan.id, 'archived')}
                            >
                              <Archive className="w-4 h-4 mr-1" />
                              Archive
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePlanStatus(existingPlan.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePlan(existingPlan.id, competency.title)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-slate-600">
                No high-gap competencies found in this assessment. Consider taking a new assessment to identify development areas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

            {/* Summary Section */}
      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-bold text-encourager font-montserrat">Action Plan Summary</h3>
        
        {/* Explanatory Text */}
        <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-encourager">
          <p className="text-slate-700 text-sm">
            This summary section will automatically populate with your short-term goals and quarterly milestones once you create action plans for the competencies above. 
            The tables below will show an overview of all your development goals across all competencies.
          </p>
        </div>


        
        {/* Short Term Goals Summary */}
        {getAllGoals().length > 0 ? (
          <div>
            <h4 className="text-xl text-encourager mb-3 font-montserrat">Short-term Goals</h4>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/2">Description</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/4">Related Competency</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/6">Target Date</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700 w-1/12">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllGoals().map((goal) => (
                        <tr key={goal.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-700">{goal.description}</td>
                          <td className="p-3 text-sm text-slate-600">{goal.competency}</td>
                          <td className="p-3 text-sm text-slate-600">{formatDateForDisplay(goal.targetDate)}</td>
                          <td className="p-3 text-center">
                            <span className={goal.completed ? "text-green-600 font-bold" : "text-slate-400"}>
                              {goal.completed ? "✓" : "✗"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <h4 className="text-xl text-encourager mb-3 font-montserrat">Short-term Goals</h4>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-slate-500">
                  <p>No short-term goals created yet. Create action plans above to see your goals here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quarterly Milestones Summary */}
        {getAllMilestones().length > 0 ? (
          <div>
            <h4 className="text-xl text-encourager mb-3 font-montserrat">Quarterly Milestones</h4>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/2">Description</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/4">Related Competency</th>
                        <th className="text-left p-3 text-sm font-medium text-slate-700 w-1/6">Target Date</th>
                        <th className="text-center p-3 text-sm font-medium text-slate-700 w-1/12">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllMilestones().map((milestone) => (
                        <tr key={milestone.id} className="border-b hover:bg-slate-50">
                          <td className="p-3 text-sm text-slate-700">{milestone.description}</td>
                          <td className="p-3 text-sm text-slate-600">{milestone.competency}</td>
                          <td className="p-3 text-sm text-slate-600">{formatDateForDisplay(milestone.targetDate)}</td>
                          <td className="p-3 text-center">
                            <span className={milestone.completed ? "text-green-600 font-bold" : "text-slate-400"}>
                              {milestone.completed ? "✓" : "✗"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <h4 className="text-xl text-encourager mb-3 font-montserrat">Quarterly Milestones</h4>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-slate-500">
                  <p>No quarterly milestones created yet. Create action plans above to see your milestones here.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-2 justify-end mt-20">
        <Button
          size="sm"
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-encourager hover:bg-encourager-light text-white"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        <Button
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-encourager hover:bg-encourager-light text-white"
        >
          <FileText className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      </div>
    </div>
  );
};

export default ActionPlanComponent; 