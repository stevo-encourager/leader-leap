
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
    // Define the main headers that should be styled as section headers
    const mainHeaders = [
      'Overall Assessment',
      'Top 3 Priority Development Areas',
      'Top Three Priority Development Areas',
      'Key Strengths to Leverage',
      'Actionable Next Step for This Week'
    ];

    // Remove ALL hashtags and asterisks completely
    const cleanedText = text.replace(/#{1,6}\s*/g, '').replace(/\*+/g, '');
    
    // Split by double newlines to create paragraphs
    const paragraphs = cleanedText.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) return null;

      // Check if this paragraph starts with one of our main headers
      const matchedHeader = mainHeaders.find(header => 
        trimmedParagraph.toLowerCase().startsWith(header.toLowerCase())
      );

      if (matchedHeader) {
        // Split the paragraph to separate header from content
        const lines = trimmedParagraph.split('\n');
        const headerLine = lines[0];
        const contentLines = lines.slice(1);
        
        // Extract just the header text (remove any trailing colons or punctuation)
        const headerText = headerLine.split(':')[0].trim();
        
        // Get the remaining content after the header
        const remainingContent = contentLines.length > 0 ? contentLines.join('\n') : 
          (headerLine.includes(':') ? headerLine.split(':').slice(1).join(':').trim() : '');
        
        return (
          <div key={index} className="mb-8">
            <h3 className="text-xl font-bold text-encourager mb-4 font-playfair border-b border-encourager/20 pb-2">
              {headerText}
            </h3>
            {remainingContent && (
              <div className="space-y-3">
                {remainingContent.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Check if it's a numbered section (e.g., "1. Emotional Intelligence (EI):")
                  const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*?):\s*(.*)$/);
                  if (numberedMatch) {
                    const number = numberedMatch[1];
                    const skillName = numberedMatch[2].trim();
                    const skillContent = numberedMatch[3].trim();
                    
                    return (
                      <div key={lineIndex} className="mb-4">
                        <p className="text-encourager font-bold mb-2">
                          {number}. {skillName}:
                        </p>
                        {skillContent && (
                          <p className="text-slate-600 ml-4 leading-relaxed">
                            {skillContent}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  // Handle "Recommendation:" specifically - show inline
                  const recommendationMatch = trimmedLine.match(/^-?\s*Recommendation:\s*(.*)$/);
                  if (recommendationMatch) {
                    const recommendationText = recommendationMatch[1].trim();
                    return (
                      <p key={lineIndex} className="text-slate-600 mb-3 ml-4 leading-relaxed">
                        <span className="font-bold">Recommendation:</span> {recommendationText}
                      </p>
                    );
                  }
                  
                  // Handle other sub-headers like "Action Plan:" but not "Recommendation"
                  const subHeaderMatch = trimmedLine.match(/^(.*?):\s*(.*)$/);
                  if (subHeaderMatch && subHeaderMatch[1].length < 30 && !subHeaderMatch[1].toLowerCase().includes('recommendation')) {
                    const subHeaderText = subHeaderMatch[1].trim();
                    const subContent = subHeaderMatch[2].trim();
                    return (
                      <div key={lineIndex} className="mb-3">
                        <p className="font-bold text-slate-700 mb-2">
                          {subHeaderText}:
                        </p>
                        {subContent && (
                          <p className="text-slate-600 ml-2 leading-relaxed">
                            {subContent}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  // Regular content line - check for bullet points
                  if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                    return (
                      <p key={lineIndex} className="text-slate-600 mb-2 ml-2 leading-relaxed">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  return (
                    <p key={lineIndex} className="text-slate-600 mb-2 leading-relaxed">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      
      // Check if it's a numbered section (e.g., "1. Emotional Intelligence (EI):")
      const numberedHeaderMatch = paragraph.match(/^(\d+)\.\s*(.*?):\s*(.*)$/s);
      if (numberedHeaderMatch) {
        const number = numberedHeaderMatch[1];
        const headerText = numberedHeaderMatch[2].trim();
        const content = numberedHeaderMatch[3].trim();
        
        return (
          <div key={index} className="mb-6">
            <p className="text-slate-700 font-bold mb-3">
              {number}. {headerText}:
            </p>
            {content && (
              <div className="ml-4 space-y-2">
                {content.split('\n').map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Handle sub-headers like "Recommendations:" or "Action Plan:"
                  const subHeaderMatch = trimmedLine.match(/^(.*?):\s*(.*)$/);
                  if (subHeaderMatch && subHeaderMatch[1].length < 30) { // Only treat short lines as headers
                    const subHeaderText = subHeaderMatch[1].trim();
                    const subContent = subHeaderMatch[2].trim();
                    return (
                      <div key={lineIndex} className="mb-3">
                        <p className="font-bold text-slate-700 mb-2">
                          {subHeaderText}:
                        </p>
                        {subContent && (
                          <p className="text-slate-600 ml-2 leading-relaxed">
                            {subContent}
                          </p>
                        )}
                      </div>
                    );
                  }
                  
                  // Regular bullet point or content line
                  if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                    return (
                      <p key={lineIndex} className="text-slate-600 mb-2 ml-2 leading-relaxed">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  return (
                    <p key={lineIndex} className="text-slate-600 mb-2 leading-relaxed">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
      
      // Check if paragraph contains sub-headers with content (but not main headers)
      if (paragraph.includes(':')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-4 space-y-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Handle sub-headers like "Recommendations:" or "Action Plan:"
              const subHeaderMatch = trimmedLine.match(/^(.*?):\s*(.*)$/);
              if (subHeaderMatch && subHeaderMatch[1].length < 30) { // Only treat short lines as headers
                const subHeaderText = subHeaderMatch[1].trim();
                const subContent = subHeaderMatch[2].trim();
                return (
                  <div key={lineIndex} className="mb-3">
                    <p className="font-bold text-slate-700 mb-2">
                      {subHeaderText}:
                    </p>
                    {subContent && (
                      <p className="text-slate-600 ml-2 leading-relaxed">
                        {subContent}
                      </p>
                    )}
                  </div>
                );
              }
              
              // Regular content line
              return (
                <p key={lineIndex} className="text-slate-600 leading-relaxed mb-2">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        );
      }
      
      // Check if it's a numbered list or bullet point
      if (paragraph.match(/^\d+\./m) || paragraph.includes('•') || paragraph.includes('-')) {
        const lines = paragraph.split('\n');
        return (
          <div key={index} className="mb-4 space-y-2">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Style numbered items differently
              if (trimmedLine.match(/^\d+\./)) {
                return (
                  <p key={lineIndex} className="mb-2 text-slate-700 font-medium">
                    {trimmedLine}
                  </p>
                );
              }
              // Style bullet points and sub-items
              return (
                <p key={lineIndex} className="mb-1 text-slate-600 ml-4 leading-relaxed">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 text-slate-600 leading-relaxed">
          {trimmedParagraph}
        </p>
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
          
          <Button
            variant="encourager"
            size="sm"
            onClick={regenerateInsights}
            disabled={isLoading}
            className="bg-encourager hover:bg-encourager-light text-white shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Refresh'}
          </Button>
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
