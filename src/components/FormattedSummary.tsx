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

  // Convert markdown links to React elements with leader validation
  const renderTextWithLinks = (text: string) => {
    // Regex to match markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Validate the link - check if it's a leader link
      const linkText = match[1];
      const linkUrl = match[2];
      
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
      
      lastIndex = linkRegex.lastIndex;
    }
    
    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
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
