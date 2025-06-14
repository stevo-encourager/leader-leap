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
// Now includes both full titles and shorter versions for flexible matching
const VALIDATED_BOOK_TITLES = [
  { full: 'Emotional Intelligence 2.0 by Travis Bradberry', short: 'Emotional Intelligence 2.0' },
  { full: 'Crucial Conversations by Kerry Patterson', short: 'Crucial Conversations' },
  { full: 'The 7 Habits of Highly Effective People by Stephen Covey', short: 'The 7 Habits of Highly Effective People' },
  { full: 'Good to Great by Jim Collins', short: 'Good to Great' },
  { full: 'Dare to Lead by Brené Brown', short: 'Dare to Lead' },
  { full: 'The Leadership Challenge by James Kouzes', short: 'The Leadership Challenge' },
  { full: 'Primal Leadership by Daniel Goleman', short: 'Primal Leadership' },
  { full: 'Atomic Habits by James Clear', short: 'Atomic Habits' },
  { full: 'Getting Things Done by David Allen', short: 'Getting Things Done' },
  { full: 'Reinventing Organisations by Frederic Laloux', short: 'Reinventing Organisations' },
  { full: 'The Pyramid Principle by Barbara Minto', short: 'The Pyramid Principle' },
  { full: 'The Captain Class by Sam Walker', short: 'The Captain Class' },
  { full: 'Leading Change by John Kotter', short: 'Leading Change' },
  { full: 'The Power of Habit by Charles Duhigg', short: 'The Power of Habit' },
  { full: 'Build, Excite, Equip by Nicola Graham', short: 'Build, Excite, Equip' },
  { full: 'The 17 Indisputable Laws of Teamwork by John Maxwell', short: 'The 17 Indisputable Laws of Teamwork' },
  { full: 'Thinking Fast and Slow by Daniel Kahneman', short: 'Thinking Fast and Slow' },
  { full: 'Getting To Yes by Roger Fisher and William Ury', short: 'Getting To Yes' },
  { full: 'Playing To Win by AG Lafley & Roger Martin', short: 'Playing To Win' },
  { full: 'Human Skills by Elizabeth Nyamayaro', short: 'Human Skills' },
  { full: 'Radical Candor by Kim Scott', short: 'Radical Candor' },
  { full: 'Nonviolent Communication by Marshall B. Rosenberg', short: 'Nonviolent Communication' }
];

/**
 * Automatically adds "(book recommendation)" labeling to validated book titles
 * @param content - The content to process
 * @returns Content with properly labeled book recommendations
 */
const addBookRecommendationLabeling = (content: string): string => {
  console.log('📚 BOOK LABELING: Starting with content length:', content.length);
  console.log('📚 BOOK LABELING: Content preview:', content.substring(0, 200) + '...');
  
  let processedContent = content;
  let totalReplacements = 0;
  
  VALIDATED_BOOK_TITLES.forEach((book, index) => {
    console.log(`📚 BOOK LABELING: Processing book ${index + 1}/${VALIDATED_BOOK_TITLES.length}: "${book.full}"`);
    
    // Try both full title and short title patterns
    const patterns = [book.full, book.short];
    
    patterns.forEach((pattern, patternIndex) => {
      console.log(`📚 BOOK LABELING: Trying pattern ${patternIndex + 1}: "${pattern}"`);
      
      // Create a more flexible regex that matches the book title but only if it doesn't already have the labeling
      // This regex looks for the book title followed by optional "by Author" and ensures it's not already labeled
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPattern}(?!\\s*\\(book recommendation\\))`, 'gi');
      
      const beforeLength = processedContent.length;
      const matches = processedContent.match(regex);
      
      if (matches) {
        console.log(`📚 BOOK LABELING: Found ${matches.length} matches for "${pattern}":`, matches);
        
        // Replace with the full book title plus the required labeling
        processedContent = processedContent.replace(regex, `${book.full} (book recommendation)`);
        totalReplacements += matches.length;
        
        const afterLength = processedContent.length;
        console.log(`📚 BOOK LABELING: Replaced "${pattern}" with "${book.full} (book recommendation)" - content length changed from ${beforeLength} to ${afterLength}`);
        
        // Return early if we found matches to avoid duplicate replacements
        return;
      } else {
        console.log(`📚 BOOK LABELING: No matches found for pattern "${pattern}"`);
      }
    });
  });
  
  console.log(`📚 BOOK LABELING: Complete - made ${totalReplacements} total replacements`);
  console.log('📚 BOOK LABELING: Final content preview:', processedContent.substring(0, 200) + '...');
  
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
  console.log('📚 INSIGHTS PROCESSING: Starting book labeling process');
  console.log('📚 INSIGHTS PROCESSING: Input insights type:', typeof insights);
  console.log('📚 INSIGHTS PROCESSING: Input insights keys:', insights ? Object.keys(insights) : 'null');
  
  if (!insights || typeof insights !== 'object') {
    console.log('📚 INSIGHTS PROCESSING: Invalid insights object, returning as-is');
    return insights;
  }

  const processedInsights = JSON.parse(JSON.stringify(insights)); // Deep clone
  console.log('📚 INSIGHTS PROCESSING: Created deep clone');

  // Process summary
  if (processedInsights.summary) {
    console.log('📚 INSIGHTS PROCESSING: Processing summary');
    const originalSummary = processedInsights.summary;
    processedInsights.summary = addBookRecommendationLabeling(processedInsights.summary);
    console.log('📚 INSIGHTS PROCESSING: Summary processed, changed:', originalSummary !== processedInsights.summary);
  }

  // Process priority areas resources
  if (processedInsights.priority_areas && Array.isArray(processedInsights.priority_areas)) {
    console.log('📚 INSIGHTS PROCESSING: Processing priority areas resources');
    processedInsights.priority_areas.forEach((area: any, index: number) => {
      console.log(`📚 INSIGHTS PROCESSING: Processing priority area ${index + 1}: ${area.competency || 'Unknown'}`);
      if (area.resources && Array.isArray(area.resources)) {
        console.log(`📚 INSIGHTS PROCESSING: Found ${area.resources.length} resources in priority area ${index + 1}`);
        area.resources = area.resources.map((resource: string, resourceIndex: number) => {
          console.log(`📚 INSIGHTS PROCESSING: Processing resource ${resourceIndex + 1}: "${resource}"`);
          const processedResource = addBookRecommendationLabeling(resource);
          console.log(`📚 INSIGHTS PROCESSING: Resource processed, changed:`, resource !== processedResource);
          return processedResource;
        });
      }
    });
  }

  // Process key strengths resources
  if (processedInsights.key_strengths && Array.isArray(processedInsights.key_strengths)) {
    console.log('📚 INSIGHTS PROCESSING: Processing key strengths resources');
    processedInsights.key_strengths.forEach((strength: any, index: number) => {
      console.log(`📚 INSIGHTS PROCESSING: Processing key strength ${index + 1}: ${strength.competency || 'Unknown'}`);
      if (strength.resources && Array.isArray(strength.resources)) {
        console.log(`📚 INSIGHTS PROCESSING: Found ${strength.resources.length} resources in key strength ${index + 1}`);
        strength.resources = strength.resources.map((resource: string, resourceIndex: number) => {
          console.log(`📚 INSIGHTS PROCESSING: Processing resource ${resourceIndex + 1}: "${resource}"`);
          const processedResource = addBookRecommendationLabeling(resource);
          console.log(`📚 INSIGHTS PROCESSING: Resource processed, changed:`, resource !== processedResource);
          return processedResource;
        });
      }
    });
  }

  console.log('📚 INSIGHTS PROCESSING: Book labeling process complete');
  return processedInsights;
};

export default formatSummaryIntoParagraphs;
