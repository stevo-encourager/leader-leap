
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { generateLeaderLink } from '@/utils/leaderMapping';

interface FormattedSummaryProps {
  summary: string;
  className?: string;
}

export const FormattedSummary: React.FC<FormattedSummaryProps> = ({ 
  summary, 
  className = "space-y-4" 
}) => {
  // Split summary into paragraphs based on transition phrases
  const splitSummary = (text: string): string[] => {
    const transitionPhrases = [
      'However,',
      'At the same time,',
      'Additionally,',
      'Your results also',
      'Furthermore,',
      'Moreover,',
      'On the other hand,',
      'Nevertheless,'
    ];
    
    // Find the first transition phrase that appears in the text
    for (const phrase of transitionPhrases) {
      const index = text.indexOf(phrase);
      if (index !== -1) {
        const firstPart = text.substring(0, index).trim();
        const secondPart = text.substring(index).trim();
        return [firstPart, secondPart];
      }
    }
    
    // If no transition phrase found, return as single paragraph
    return [text];
  };

  // Convert HTML anchor tags and markdown links to React elements with leader validation
  const renderTextWithLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Combined regex to match both HTML anchor tags and markdown links
    const combinedRegex = /<a href="([^"]+)">([^<]+)<\/a>|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(beforeText);
      }
      
      if (match[1] && match[2]) {
        // HTML anchor tag format: <a href="url">text</a>
        const linkUrl = match[1];
        const linkText = match[2];
        
        parts.push(
          <a
            key={match.index}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-encourager hover:text-encourager-light underline inline-flex items-center gap-1"
          >
            {linkText}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      } else if (match[3] && match[4]) {
        // Markdown format: [text](url)
        const linkText = match[3];
        const linkUrl = match[4];
        
        // Try to validate as a leader first
        const leaderValidation = generateLeaderLink(linkText);
        
        if (leaderValidation.hasValidLink) {
          // Use validated leader link
          parts.push(
            <a
              key={match.index}
              href={leaderValidation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-encourager hover:text-encourager-light underline inline-flex items-center gap-1"
            >
              {leaderValidation.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        } else {
          // Use original link if it's not a leader or if leader validation fails
          parts.push(
            <a
              key={match.index}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-encourager hover:text-encourager-light underline inline-flex items-center gap-1"
            >
              {linkText}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
      }
      
      lastIndex = combinedRegex.lastIndex;
    }
    
    // Add remaining text after the last link
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(remainingText);
    }
    
    return parts.length > 0 ? parts : [text];
  };

  const paragraphs = splitSummary(summary);

  return (
    <div className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-slate-700 leading-relaxed">
          {renderTextWithLinks(paragraph)}
        </p>
      ))}
    </div>
  );
};
