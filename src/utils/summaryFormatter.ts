
/**
 * Utility function to format AI-generated assessment summaries into readable paragraphs
 */

export interface FormattingOptions {
  usePTags?: boolean; // Whether to wrap paragraphs in <p> tags (for HTML). Defaults to false (using \n\n)
  minParagraphLength?: number; // Minimum length for a paragraph to be considered valid
  transitionPhrases?: string[]; // Custom transition phrases to look for
}

const DEFAULT_TRANSITION_PHRASES = [
  'However,', 'At the same time,', 'Additionally,', 'Furthermore,', 'Moreover,',
  'Nevertheless,', 'On the other hand,', 'Meanwhile,', 'In contrast,', 'Similarly,',
  'Consequently,', 'Therefore,', 'Thus,', 'As a result,', 'In addition,',
  'Your results also', 'Your assessment also', 'These results', 'This assessment',
  'Conversely,', 'Nonetheless,', 'Likewise,', 'Subsequently,', 'Alternatively,'
];

// List of validated book titles that should have "(book recommendation)" labeling
const VALIDATED_BOOK_TITLES = [
  'Emotional Intelligence 2.0 by Travis Bradberry',
  'Crucial Conversations by Kerry Patterson',
  'The 7 Habits of Highly Effective People by Stephen Covey',
  'Good to Great by Jim Collins',
  'Dare to Lead by Brené Brown',
  'The Leadership Challenge by James Kouzes',
  'Primal Leadership by Daniel Goleman',
  'Atomic Habits by James Clear',
  'Getting Things Done by David Allen',
  'Reinventing Organisations by Frederic Laloux',
  'The Pyramid Principle by Barbara Minto',
  'The Captain Class by Sam Walker',
  'Leading Change by John Kotter',
  'The Power of Habit by Charles Duhigg',
  'Build, Excite, Equip by Nicola Graham',
  'The 17 Indisputable Laws of Teamwork by John Maxwell',
  'Thinking Fast and Slow by Daniel Kahneman',
  'Getting To Yes by Roger Fisher and William Ury',
  'Playing To Win by AG Lafley & Roger Martin',
  'Human Skills by Elizabeth Nyamayaro',
  'Radical Candor by Kim Scott',
  'Nonviolent Communication by Marshall B. Rosenberg'
];

/**
 * Automatically adds "(book recommendation)" labeling to validated book titles
 * @param content - The content to process
 * @returns Content with properly labeled book recommendations
 */
const addBookRecommendationLabeling = (content: string): string => {
  let processedContent = content;
  
  VALIDATED_BOOK_TITLES.forEach(bookTitle => {
    // Create a regex that matches the book title but only if it doesn't already have the labeling
    const regex = new RegExp(`\\b${bookTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\s*\\(book recommendation\\))`, 'gi');
    
    // Replace with the book title plus the required labeling
    processedContent = processedContent.replace(regex, `${bookTitle} (book recommendation)`);
  });
  
  return processedContent;
};

/**
 * Formats an AI-generated summary into well-structured paragraphs
 * 
 * @param summary - The AI-generated summary text
 * @param options - Formatting options
 * @returns The formatted summary with proper paragraph separation
 */
export const formatSummaryIntoParagraphs = (
  summary: string, 
  options: FormattingOptions = {}
): string => {
  const {
    usePTags = false,
    minParagraphLength = 30,
    transitionPhrases = DEFAULT_TRANSITION_PHRASES
  } = options;

  if (!summary || summary.trim().length === 0) {
    return "";
  }

  // First, apply book recommendation labeling
  let formatted = addBookRecommendationLabeling(summary);
  
  // Normalize whitespace and remove existing line breaks
  formatted = formatted.replace(/\s+/g, ' ').trim();
  
  // Try to split by transition phrases first
  for (const phrase of transitionPhrases) {
    const phraseIndex = formatted.indexOf(phrase);
    
    // Ensure the phrase appears after some meaningful content
    if (phraseIndex > 50) {
      const firstPart = formatted.substring(0, phraseIndex).trim();
      const secondPart = formatted.substring(phraseIndex).trim();
      
      // Ensure both parts have meaningful content
      if (firstPart.length > minParagraphLength && secondPart.length > minParagraphLength) {
        console.log(`Split summary using transition phrase: "${phrase}"`);
        
        if (usePTags) {
          return `<p>${firstPart}</p><p>${secondPart}</p>`;
        } else {
          return `${firstPart}\n\n${secondPart}`;
        }
      }
    }
  }
  
  // Fallback: split by sentence count if no transition phrases work
  const sentences = formatted.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  if (sentences.length >= 4) {
    // For 4+ sentences, split roughly 60/40 to favor the first paragraph
    const splitPoint = Math.ceil(sentences.length * 0.6);
    const firstParagraph = sentences.slice(0, splitPoint).join(' ').trim();
    const secondParagraph = sentences.slice(splitPoint).join(' ').trim();
    
    // Ensure both paragraphs meet minimum length
    if (firstParagraph.length > minParagraphLength && secondParagraph.length > minParagraphLength) {
      console.log(`Split summary by sentence count: ${sentences.length} sentences, split at ${splitPoint}`);
      
      if (usePTags) {
        return `<p>${firstParagraph}</p><p>${secondParagraph}</p>`;
      } else {
        return `${firstParagraph}\n\n${secondParagraph}`;
      }
    }
  }
  
  // If unable to split meaningfully, return as single paragraph
  console.log('Summary could not be split meaningfully, returning as single paragraph');
  
  if (usePTags) {
    return `<p>${formatted}</p>`;
  } else {
    return formatted;
  }
};

/**
 * Processes insights data to ensure all book recommendations are properly labeled
 * @param insights - The insights object from OpenAI
 * @returns Processed insights with proper book labeling
 */
export const processInsightsForBookLabeling = (insights: any): any => {
  if (!insights || typeof insights !== 'object') {
    return insights;
  }

  const processedInsights = JSON.parse(JSON.stringify(insights)); // Deep clone

  // Process summary
  if (processedInsights.summary) {
    processedInsights.summary = addBookRecommendationLabeling(processedInsights.summary);
  }

  // Process priority areas resources
  if (processedInsights.priority_areas && Array.isArray(processedInsights.priority_areas)) {
    processedInsights.priority_areas.forEach((area: any) => {
      if (area.resources && Array.isArray(area.resources)) {
        area.resources = area.resources.map((resource: string) => addBookRecommendationLabeling(resource));
      }
    });
  }

  // Process key strengths resources
  if (processedInsights.key_strengths && Array.isArray(processedInsights.key_strengths)) {
    processedInsights.key_strengths.forEach((strength: any) => {
      if (strength.resources && Array.isArray(strength.resources)) {
        strength.resources = strength.resources.map((resource: string) => addBookRecommendationLabeling(resource));
      }
    });
  }

  return processedInsights;
};

export default formatSummaryIntoParagraphs;
