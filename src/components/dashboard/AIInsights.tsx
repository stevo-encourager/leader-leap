import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { Bot, Sparkles, BookOpen, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Button } from '@/components/ui/button';

interface AIInsightsProps {
  categories: Category[];
  demographics?: Demographics;
  averageGap?: number;
  assessmentId?: string;
  className?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  categories, 
  demographics = {}, 
  averageGap = 0,
  assessmentId,
  className = '' 
}) => {
  // CRITICAL DEBUG: Log at the very top of AIInsights
  console.log('🔍 🚨 AI INSIGHTS - COMPONENT RENDER START:', {
    assessmentId,
    categories: categories?.length || 0,
    demographics: Object.keys(demographics || {}),
    averageGap
  });

  const { insights, isLoading, error, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  // CRITICAL DEBUG: Log insights state
  console.log('🔍 🚨 AI INSIGHTS - STATE:', {
    hasInsights: !!insights,
    insightsLength: insights?.length || 0,
    isLoading,
    hasError: !!error,
    assessmentId
  });

  const [parsedInsights, setParsedInsights] = useState<any>(null);

  // Special test assessment ID that allows regeneration
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  // CRITICAL DEBUG: Log test assessment check
  console.log('🔍 🚨 AI INSIGHTS - TEST ASSESSMENT CHECK:', {
    assessmentId,
    TEST_ASSESSMENT_ID,
    isTestAssessment
  });

  // Parse insights when they're available
  useEffect(() => {
    if (insights && insights.trim() && insights !== 'null' && insights !== 'undefined') {
      try {
        const parsed = JSON.parse(insights);
        setParsedInsights(parsed);
        console.log('AIInsights: Successfully parsed insights JSON');
      } catch (error) {
        console.error('AIInsights: Failed to parse insights JSON:', error);
        // If parsing fails, treat as plain text
        setParsedInsights({ summary: insights });
      }
    } else {
      setParsedInsights(null);
    }
  }, [insights]);

  console.log('AIInsights: Rendering with assessmentId:', assessmentId);
  console.log('AIInsights: Insights available:', !!insights);
  console.log('AIInsights: Loading state:', isLoading);
  
  if (isLoading) {
    console.log('AIInsights: Showing loading state');
  } else if (insights) {
    console.log('AIInsights: Using insights from database for consistent display');
  }

  // Handle regenerate insights for test assessment
  const handleRegenerateInsights = () => {
    console.log('🔍 🚨 AI INSIGHTS - REGENERATE BUTTON CLICKED:', {
      isTestAssessment,
      assessmentId
    });
    
    if (isTestAssessment) {
      console.log('AIInsights: Regenerating insights for test assessment');
      regenerateInsights();
    } else {
      console.log('AIInsights: Cannot regenerate - not a test assessment');
    }
  };

  
  
  return (
    <Card className={`bg-white shadow-lg border-encourager/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-encourager/10 to-encourager-accent/10 border-b border-encourager/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <Bot className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-2xl text-encourager font-playfair">AI-Powered Leadership Insights</CardTitle>
              <CardDescription className="text-encourager/70 mt-1">
                Personalized development recommendations powered by artificial intelligence
              </CardDescription>
            </div>
          </div>
          {isTestAssessment && (
            <Button
              onClick={handleRegenerateInsights}
              disabled={isLoading}
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Bot className="h-12 w-12 text-encourager animate-pulse" />
                <Sparkles className="h-6 w-6 text-encourager-accent absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-encourager mb-2">EncouragerGPT is analyzing your results...</p>
                <p className="text-sm text-slate-500">This may take up to 30 seconds</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Target className="h-5 w-5" />
              <span className="font-medium">Unable to generate insights</span>
            </div>
            <p className="text-red-700 mt-2 text-sm">{error}</p>
          </div>
        )}

        {!isLoading && insights && parsedInsights && (
          <div className="space-y-6">
            {/* Summary Section */}
            {parsedInsights.summary && (
              <div className="bg-encourager/5 p-4 rounded-lg border border-encourager/20">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-encourager" />
                  <h3 className="text-lg font-semibold text-encourager">Executive Summary</h3>
                </div>
                <p className="text-slate-700 leading-relaxed">{parsedInsights.summary}</p>
              </div>
            )}

            {/* Priority Areas */}
            {parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-encourager" />
                  <h3 className="text-lg font-semibold text-encourager">Priority Development Areas</h3>
                </div>
                <div className="space-y-4">
                  {parsedInsights.priority_areas.map((area: any, index: number) => (
                    <div key={index} className="bg-white border border-encourager/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-800">{area.competency}</h4>
                        <Badge variant="outline" className="bg-encourager/10 text-encourager border-encourager/30">
                          Gap: {area.gap.toFixed(1)}
                        </Badge>
                      </div>
                      {area.insights && area.insights.length > 0 && (
                        <ul className="space-y-2 mb-3">
                          {area.insights.map((insight: string, insightIndex: number) => (
                            <li key={insightIndex} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-encourager-accent font-bold">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Strengths */}
            {parsedInsights.key_strengths && parsedInsights.key_strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-encourager" />
                  <h3 className="text-lg font-semibold text-encourager">Key Strengths to Leverage</h3>
                </div>
                <div className="space-y-4">
                  {parsedInsights.key_strengths.map((strength: any, index: number) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">{strength.competency}</h4>
                      {strength.example && (
                        <p className="text-sm text-green-700 mb-3 italic">{strength.example}</p>
                      )}
                      {strength.leverage_advice && strength.leverage_advice.length > 0 && (
                        <ul className="space-y-1">
                          {strength.leverage_advice.map((advice: string, adviceIndex: number) => (
                            <li key={adviceIndex} className="text-sm text-green-600 flex items-start gap-2">
                              <span className="text-green-500 font-bold">•</span>
                              <span>{advice}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && !insights && !error && (
          <div className="text-center py-8 text-slate-500">
            <Bot className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <p>No AI insights available yet. Complete your assessment to get personalized recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
