
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { generateLeaderLink } from '@/utils/leaderMapping';

interface FormattedSummaryProps {
  summary: string;
  className?: string;
}

// List of validated book titles that should have "(book recommendation)" labeling
const BOOK_TITLES = [
  'Emotional Intelligence 2.0 by Travis Bradberry',
  'Emotional Intelligence 2.0',
  'Crucial Conversations by Kerry Patterson',
  'Crucial Conversations',
  'The 7 Habits of Highly Effective People by Stephen Covey',
  'The 7 Habits of Highly Effective People',
  'Good to Great by Jim Collins',
  'Good to Great',
  'Dare to Lead by Brené Brown',
  'Dare to Lead',
  'The Leadership Challenge by James Kouzes',
  'The Leadership Challenge',
  'Primal Leadership by Daniel Goleman',
  'Primal Leadership',
  'Atomic Habits by James Clear',
  'Atomic Habits',
  'Getting Things Done by David Allen',
  'Getting Things Done',
  'Reinventing Organisations by Frederic Laloux',
  'Reinventing Organisations',
  'The Pyramid Principle by Barbara Minto',
  'The Pyramid Principle',
  'The Captain Class by Sam Walker',
  'The Captain Class',
  'Leading Change by John Kotter',
  'Leading Change',
  'The Power of Habit by Charles Duhigg',
  'The Power of Habit',
  'Build, Excite, Equip by Nicola Graham',
  'Build, Excite, Equip',
  'The 17 Indisputable Laws of Teamwork by John Maxwell',
  'The 17 Indisputable Laws of Teamwork',
  'Thinking Fast and Slow by Daniel Kahneman',
  'Thinking Fast and Slow',
  'Getting To Yes by Roger Fisher and William Ury',
  'Getting To Yes',
  'Playing To Win by AG Lafley & Roger Martin',
  'Playing To Win',
  'Human Skills by Elizabeth Nyamayaro',
  'Human Skills',
  'Radical Candor by Kim Scott',
  'Radical Candor',
  'Nonviolent Communication by Marshall B. Rosenberg',
  'Nonviolent Communication'
];

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
  // Also automatically add "(book recommendation)" to detected book titles
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

  // Function to automatically add "(book recommendation)" to detected book titles
  const addBookLabeling = (text: string) => {
    let processedText = text;
    
    // Check each book title and add labeling if not already present
    BOOK_TITLES.forEach(bookTitle => {
      // Create regex that matches the book title but only if it doesn't already have the labeling
      const escapedTitle = bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTitle}(?!\\s*\\(book recommendation\\))`, 'gi');
      
      if (regex.test(processedText)) {
        // Replace with the book title plus the required labeling
        processedText = processedText.replace(regex, `${bookTitle} (book recommendation)`);
      }
    });
    
    return processedText;
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
