
import React from 'react';
import { Bot, AlertCircle, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

interface Recommendation {
  advice: string;
  resource: string;
}

interface PriorityArea {
  competency: string;
  gap: number;
  recommendations: Recommendation[];
}

interface KeyStrength {
  competency: string;
  example: string;
  leverage_advice: string;
}

interface AIInsightsData {
  priority_areas: PriorityArea[];
  key_strengths: KeyStrength[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ categories, demographics, averageGap, assessmentId }) => {
  const { insights, isLoading, error } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      
      // Validate structure
      if (!parsed.priority_areas || !parsed.key_strengths) {
        console.error('Invalid insights structure - missing required arrays');
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.error('Invalid insights structure - arrays expected');
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing insights JSON:', error);
      return null;
    }
  };

  const renderPriorityAreas = (priorityAreas: PriorityArea[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Top 3 Priority Development Areas
      </h3>
      <div className="space-y-6">
        {priorityAreas.map((area, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="mb-3">
              <h4 className="font-semibold text-lg text-slate-800">
                {index + 1}. {area.competency}
              </h4>
              <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                Gap: {area.gap.toFixed(1)}
              </span>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-slate-700">Recommendations:</h5>
              {area.recommendations.map((rec, recIndex) => (
                <div key={recIndex} className="bg-slate-50 p-3 rounded border-l-4 border-encourager">
                  <p className="text-slate-700 mb-2">{rec.advice}</p>
                  <a 
                    href={rec.resource} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-encourager hover:text-encourager-light text-sm flex items-center gap-1 underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Resource
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKeyStrengths = (keyStrengths: KeyStrength[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Key Strengths to Leverage
      </h3>
      <div className="space-y-4">
        {keyStrengths.map((strength, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <h4 className="font-semibold text-lg text-slate-800 mb-2">
              {strength.competency}
            </h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                <p className="text-sm text-slate-600 font-medium">Example:</p>
                <p className="text-slate-700">{strength.example}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <p className="text-sm text-slate-600 font-medium">How to leverage further:</p>
                <p className="text-slate-700">{strength.leverage_advice}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* AI-Powered Insights Header */}
      <div className="bg-encourager/5 p-6 rounded-lg border border-encourager/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <Bot className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-encourager font-playfair">AI-Powered Insights</h2>
              <p className="text-sm text-slate-600 mt-1">
                Personalized leadership development recommendations powered by GPT-4o
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-encourager">
              <Bot className="animate-pulse" size={24} />
              <span className="text-lg">AI is analyzing your assessment results...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-red-700 font-medium">Unable to generate insights</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {insights && !isLoading && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
            {(() => {
              const parsedInsights = parseInsights(insights);
              
              if (!parsedInsights) {
                return (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="mx-auto mb-3" size={40} />
                    <p className="text-lg">Unable to parse AI insights</p>
                    <p className="text-sm">The insights format appears to be invalid.</p>
                  </div>
                );
              }

              return (
                <div className="prose prose-slate max-w-none">
                  {renderPriorityAreas(parsedInsights.priority_areas)}
                  {renderKeyStrengths(parsedInsights.key_strengths)}
                </div>
              );
            })()}
          </div>
        )}

        {!insights && !isLoading && !error && (
          <div className="text-center py-8 text-slate-500">
            <Bot className="mx-auto mb-3" size={40} />
            <p className="text-lg">AI insights will appear here once your assessment data is analyzed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
