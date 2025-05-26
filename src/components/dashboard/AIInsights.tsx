
import React from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ categories, demographics, averageGap, assessmentId }) => {
  const { insights, isLoading, error } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  const formatInsights = (text: string) => {
    // Since we now have a very structured format from the prompt, we can parse it more predictably
    const sections = text.split('## ').filter(section => section.trim());

    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      if (title === 'Overall Assessment') {
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
              Overall Assessment
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content}
            </p>
          </div>
        );
      }

      if (title === 'Top 3 Priority Development Areas') {
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
              Top 3 Priority Development Areas
            </h3>
            <div className="space-y-4">
              {content.split('\n\n').map((item, itemIndex) => {
                const trimmedItem = item.trim();
                if (!trimmedItem) return null;

                // Parse the structured format: "1. Competency (Gap: X.X): Recommendations: text"
                const match = trimmedItem.match(/^(\d+)\.\s*(.+?)\s*\(Gap:\s*([\d.]+)\):\s*Recommendations:\s*(.+)$/s);
                
                if (match) {
                  const [, number, competency, gap, recommendations] = match;
                  
                  return (
                    <div key={itemIndex} className="mb-4">
                      <p className="text-slate-700 leading-relaxed">
                        <span className="font-medium">{number}. {competency.trim()} (Gap: {gap})</span>: Recommendations: {recommendations.trim()}
                      </p>
                    </div>
                  );
                }

                // Fallback for any non-matching content
                return (
                  <p key={itemIndex} className="text-slate-600 leading-relaxed mb-2">
                    {trimmedItem}
                  </p>
                );
              })}
            </div>
          </div>
        );
      }

      if (title === 'Key Strengths to Leverage') {
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
              Key Strengths to Leverage
            </h3>
            <div className="space-y-2">
              {content.split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
                
                return (
                  <p key={lineIndex} className="text-slate-600 leading-relaxed">
                    {trimmedLine}
                  </p>
                );
              })}
            </div>
          </div>
        );
      }

      if (title === 'Actionable Next Step for This Week') {
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
              Actionable Next Step for This Week
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content}
            </p>
          </div>
        );
      }

      // Fallback for any unexpected sections
      return (
        <div key={index} className="mb-8">
          <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
            {title}
          </h3>
          <p className="text-slate-600 leading-relaxed">
            {content}
          </p>
        </div>
      );
    });
  };

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
            <div className="prose prose-slate max-w-none">
              {formatInsights(insights)}
            </div>
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
