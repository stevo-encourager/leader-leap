
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
  // Comprehensive list of book titles that should be labeled as book recommendations
  const BOOK_TITLES = [
    'Emotional Intelligence 2.0',
    'Crucial Conversations', 
    'The 7 Habits of Highly Effective People',
    'Good to Great',
    'Dare to Lead',
    'The Leadership Challenge',
    'Primal Leadership',
    'Atomic Habits',
    'Getting Things Done',
    'Reinventing Organisations',
    'The Pyramid Principle',
    'The Captain Class',
    'Leading Change',
    'The Power of Habit',
    'Build, Excite, Equip',
    'The 17 Indisputable Laws of Teamwork',
    'Thinking Fast and Slow',
    'Getting To Yes',
    'Playing To Win',
    'Human Skills',
    'Radical Candor',
    'Nonviolent Communication',
    'Emotional Intelligence' // Also handle the shorter version
  ];

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

  // Enhanced book labeling function that handles various formats
  const addBookLabeling = (text: string) => {
    console.log('📚 FRONTEND: Starting enhanced book labeling for text:', text.substring(0, 100) + '...');
    
    let processedText = text;
    let replacements = 0;
    
    // Process each book title
    BOOK_TITLES.forEach(bookTitle => {
      console.log('📚 FRONTEND: Processing book title:', bookTitle);
      
      // Create multiple patterns to match different formats:
      // 1. "Title by Author" format
      // 2. Just "Title" format
      // 3. "Title by Author (already labeled)" - skip these
      
      const patterns = [
        // Match "Title by [Author]" format that doesn't already have labeling
        new RegExp(`\\b${bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+by\\s+[A-Za-z\\s&.''-]+(?!\\s*\\(book recommendation\\))`, 'gi'),
        // Match just "Title" format that doesn't already have labeling
        new RegExp(`\\b${bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\s+by)(?!\\s*\\(book recommendation\\))`, 'gi')
      ];
      
      patterns.forEach((pattern, index) => {
        const matches = processedText.match(pattern);
        if (matches) {
          console.log(`📚 FRONTEND: Found ${matches.length} matches for "${bookTitle}" with pattern ${index + 1}:`, matches);
          
          matches.forEach(match => {
            const replacement = `${match} (book recommendation)`;
            console.log('📚 FRONTEND: Replacing:', match, '→', replacement);
            processedText = processedText.replace(match, replacement);
            replacements++;
          });
        }
      });
    });
    
    console.log('📚 FRONTEND: Made', replacements, 'book labeling replacements');
    return processedText;
  };

  // Convert HTML anchor tags and markdown links to React elements with leader validation
  const renderTextWithLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Combined regex to match both HTML anchor tags and markdown links
    const combinedRegex = /<a href="([^"]+)">([^<]+)<\/a>|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the link (with book labeling applied)
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(addBookLabeling(beforeText));
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
            {addBookLabeling(linkText)}
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
              {addBookLabeling(leaderValidation.name)}
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
              {addBookLabeling(linkText)}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
      }
      
      lastIndex = combinedRegex.lastIndex;
    }
    
    // Add remaining text after the last link (with book labeling applied)
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(addBookLabeling(remainingText));
    }
    
    return parts.length > 0 ? parts : [addBookLabeling(text)];
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
