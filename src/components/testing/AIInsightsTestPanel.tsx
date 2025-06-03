
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AIInsights from '@/components/dashboard/AIInsights';

// Sample assessment data from a recent assessment for testing
const SAMPLE_ASSESSMENT_DATA = {
  categories: [
    {
      id: "strategic-thinking",
      title: "Strategic Thinking/Vision",
      description: "Strategic thinking and vision competencies",
      skills: [
        { id: "future-vision", name: "Future Vision", description: "", ratings: { current: 5, desired: 7 } },
        { id: "big-picture", name: "Big Picture Thinking", description: "", ratings: { current: 3, desired: 7 } },
        { id: "strategic-planning", name: "Strategic Planning", description: "", ratings: { current: 2, desired: 7 } }
      ]
    },
    {
      id: "communication",
      title: "Communication",
      description: "Communication competencies",
      skills: [
        { id: "verbal-comm", name: "Verbal Communication", description: "", ratings: { current: 4, desired: 7 } },
        { id: "written-comm", name: "Written & Visual Communication", description: "", ratings: { current: 5, desired: 7 } },
        { id: "active-listening", name: "Active Listening", description: "", ratings: { current: 7, desired: 7 } }
      ]
    },
    {
      id: "decision-making",
      title: "Decision Making",
      description: "Decision making competencies",
      skills: [
        { id: "analytical-thinking", name: "Analytical Thinking", description: "", ratings: { current: 3, desired: 7 } },
        { id: "problem-solving", name: "Problem Solving", description: "", ratings: { current: 4, desired: 7 } },
        { id: "risk-assessment", name: "Risk Assessment", description: "", ratings: { current: 2, desired: 6 } }
      ]
    },
    {
      id: "time-management",
      title: "Time/Priority Management",
      description: "Time and priority management competencies",
      skills: [
        { id: "prioritization", name: "Prioritization", description: "", ratings: { current: 3, desired: 7 } },
        { id: "time-planning", name: "Time Planning", description: "", ratings: { current: 3, desired: 7 } },
        { id: "delegation", name: "Delegation", description: "", ratings: { current: 4, desired: 8 } }
      ]
    },
    {
      id: "professional-development",
      title: "Professional Development",
      description: "Professional development competencies",
      skills: [
        { id: "continuous-learning", name: "Continuous Learning", description: "", ratings: { current: 6, desired: 7 } },
        { id: "self-reflection", name: "Self-Reflection", description: "", ratings: { current: 5, desired: 6 } },
        { id: "skill-building", name: "Skill Building", description: "", ratings: { current: 5, desired: 7 } }
      ]
    }
  ],
  demographics: {
    role: "Senior Manager",
    industry: "Technology",
    teamSize: "5-10 people",
    experience: "5-10 years"
  }
};

const AIInsightsTestPanel: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testNotes, setTestNotes] = useState('');

  const calculateAverageGap = (categories: any[]) => {
    let totalGap = 0;
    let skillCount = 0;
    
    categories.forEach(category => {
      category.skills.forEach((skill: any) => {
        const gap = skill.ratings.desired - skill.ratings.current;
        totalGap += gap;
        skillCount++;
      });
    });
    
    return skillCount > 0 ? totalGap / skillCount : 0;
  };

  const generateTestInsights = async () => {
    setIsGenerating(true);
    setError(null);
    setInsights(null);

    try {
      console.log('AIInsightsTestPanel: Starting test insights generation');
      
      const averageGap = calculateAverageGap(SAMPLE_ASSESSMENT_DATA.categories);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-insights', {
        body: {
          categories: SAMPLE_ASSESSMENT_DATA.categories,
          demographics: SAMPLE_ASSESSMENT_DATA.demographics,
          averageGap,
          assessmentId: null // No assessment ID for testing
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data && data.insights) {
        setInsights(data.insights);
        console.log('AIInsightsTestPanel: Successfully generated test insights');
        
        toast({
          title: "Test Insights Generated",
          description: "AI insights have been generated successfully for testing.",
        });
      } else {
        throw new Error('No insights received from OpenAI');
      }
    } catch (err) {
      console.error('AIInsightsTestPanel: Error generating test insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      
      toast({
        title: "Test Generation Failed",
        description: "There was an error generating the test insights.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setInsights(null);
    setError(null);
    setTestNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="h-5 w-5" />
            AI Insights Test Panel
          </CardTitle>
          <p className="text-sm text-blue-600">
            Test AI insights generation with sample assessment data. Perfect for iterating on ChatGPT prompts.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={generateTestInsights}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate Test Insights
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearResults}
              disabled={isGenerating}
            >
              Clear Results
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-700">Test Notes:</label>
            <Textarea
              placeholder="Add notes about this test iteration (e.g., 'Testing new leader validation', 'Updated resource links', etc.)"
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              className="h-20"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-slate-600">Sample Assessment Data Being Used:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-slate-500 space-y-2">
            <p><strong>Categories:</strong> {SAMPLE_ASSESSMENT_DATA.categories.map(c => c.title).join(', ')}</p>
            <p><strong>Demographics:</strong> {SAMPLE_ASSESSMENT_DATA.demographics.role} in {SAMPLE_ASSESSMENT_DATA.demographics.industry}</p>
            <p><strong>Average Gap:</strong> {calculateAverageGap(SAMPLE_ASSESSMENT_DATA.categories).toFixed(1)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Insights Display */}
      {insights && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Generated Test Insights:</h3>
            {testNotes && (
              <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Notes: {testNotes}
              </div>
            )}
          </div>
          
          <AIInsights 
            categories={SAMPLE_ASSESSMENT_DATA.categories}
            demographics={SAMPLE_ASSESSMENT_DATA.demographics}
            averageGap={calculateAverageGap(SAMPLE_ASSESSMENT_DATA.categories)}
            assessmentId={undefined}
          />
        </div>
      )}
    </div>
  );
};

export default AIInsightsTestPanel;
