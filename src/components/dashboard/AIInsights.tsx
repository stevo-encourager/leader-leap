
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, TrendingUp, Target, Users, Sparkles } from 'lucide-react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { calculateInsights } from '@/utils/assessmentCalculations';
import LargestGapsSection from './insights/LargestGapsSection';
import SmallestGapsSection from './insights/SmallestGapsSection';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  categories, 
  demographics, 
  averageGap, 
  assessmentId 
}) => {
  const { insights: aiInsights, isLoading: aiLoading, error: aiError } = useOpenAIInsights({
    categories, 
    demographics, 
    averageGap,
    assessmentId
  });

  // Calculate local insights immediately
  const localInsights = calculateInsights(categories);

  return (
    <Card className="bg-white shadow-lg border-slate-200">
      <CardHeader className="bg-gradient-to-r from-encourager to-encourager-light text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription className="text-encourager-light">
          Personalized analysis of your leadership assessment results
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-white w-full">
        {/* Assessment Summary */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-encourager" />
            Assessment Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-encourager">{categories.length}</div>
              <div className="text-sm text-slate-600">Competency Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-encourager">{averageGap.toFixed(1)}</div>
              <div className="text-sm text-slate-600">Average Development Gap</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-encourager">
                {localInsights.skillsMeetingExpectations.length}
              </div>
              <div className="text-sm text-slate-600">Skills Meeting Expectations</div>
            </div>
          </div>
        </div>

        {/* Local Insights Sections */}
        <div className="space-y-6">
          <LargestGapsSection 
            insights={localInsights}
          />
          
          <SmallestGapsSection 
            insights={localInsights}
          />
        </div>

        {/* AI Insights Section */}
        <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-encourager" />
            AI-Generated Development Insights
          </h3>
          
          {aiLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI is analyzing your assessment results...</span>
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> AI insights are temporarily unavailable, but your detailed assessment results above provide comprehensive analysis of your leadership competencies.
              </p>
            </div>
          )}

          {aiInsights && !aiLoading && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">AI Analysis</h4>
                <div className="prose prose-sm text-slate-700">
                  {aiInsights}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
