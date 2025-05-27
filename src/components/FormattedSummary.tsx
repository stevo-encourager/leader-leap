
import React from 'react';
import { formatSummaryIntoParagraphs, FormattingOptions } from '@/utils/summaryFormatter';

interface FormattedSummaryProps {
  summary: string;
  className?: string;
  options?: FormattingOptions;
}

/**
 * React component to render formatted summary with proper paragraph structure
 */
export const FormattedSummary: React.FC<FormattedSummaryProps> = ({ 
  summary, 
  className = "", 
  options = {} 
}) => {
  const formattedSummary = formatSummaryIntoParagraphs(summary, options);
  
  // Split by double line breaks to create separate paragraph elements
  const paragraphs = formattedSummary.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0 text-slate-700 leading-relaxed">
          {paragraph.trim()}
        </p>
      ))}
    </div>
  );
};

export default FormattedSummary;
