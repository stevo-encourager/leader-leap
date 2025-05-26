
import React from 'react';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({ categories, demographics, averageGap }) => {
  const { insights, isLoading, error, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap
  });

  const formatInsights = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a numbered list or bullet point
      if (paragraph.match(/^\d+\./m) || paragraph.includes('•') || paragraph.includes('-')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-4">
            {lines.map((line, lineIndex) => (
              <p key={lineIndex} className="mb-1 text-slate-700">
                {line.trim()}
              </p>
            ))}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-3 text-slate-700 leading-relaxed">
          {paragraph.trim()}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Bot className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">AI-Powered Insights</h3>
            <p className="text-sm text-blue-600">Personalized recommendations from GPT-4o</p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={regenerateInsights}
          disabled={isLoading}
          className="border-blue-300 text-blue-700 hover:bg-blue-100"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Generating...' : 'Refresh'}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-blue-600">
            <Bot className="animate-pulse" size={24} />
            <span>AI is analyzing your assessment results...</span>
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
        <div className="prose prose-slate max-w-none">
          {formatInsights(insights)}
        </div>
      )}

      {!insights && !isLoading && !error && (
        <div className="text-center py-6 text-slate-500">
          <Bot className="mx-auto mb-2" size={32} />
          <p>AI insights will appear here once your assessment data is analyzed.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
