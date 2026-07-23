
/**
 * Utility function to format AI-generated assessment summaries into readable paragraphs
 */

export interface FormattingOptions {
  usePTags?: boolean; // Whether to wrap paragraphs in <p> tags (for HTML). Defaults to false (using \n\n)
  minParagraphLength?: number; // Minimum length for a paragraph to be considered valid
  transitionPhrases?: string[]; // Custom transition phrases to look for
}

// NOTE: This list is a near-duplicate of the one in
// supabase/functions/generate-insights/utils/formatting.ts. The two should
// eventually share a single source; until then, keep them in sync when editing.
// The mandated closing paragraph is listed first so it wins over the generic
// transition words and the split lands on the real paragraph boundary. The
// legacy "Moving forward," opener is retained for summaries saved before the
// closer was reworded.
const DEFAULT_TRANSITION_PHRASES = [
  "Don't try to fix everything at once.", 'Moving forward,',
  'However,', 'At the same time,', 'Additionally,', 'Furthermore,', 'Moreover,',
  'Nevertheless,', 'On the other hand,', 'Meanwhile,', 'In contrast,', 'Similarly,',
  'Consequently,', 'Therefore,', 'Thus,', 'As a result,', 'In addition,',
  'Your results also', 'Your assessment also', 'These results', 'This assessment',
  'Conversely,', 'Nonetheless,', 'Likewise,', 'Subsequently,', 'Alternatively,'
];

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

  let formatted = summary;
  
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
      if (usePTags) {
        return `<p>${firstParagraph}</p><p>${secondParagraph}</p>`;
      } else {
        return `${firstParagraph}\n\n${secondParagraph}`;
      }
    }
  }
  
  // If unable to split meaningfully, return as single paragraph
  if (usePTags) {
    return `<p>${formatted}</p>`;
  } else {
    return formatted;
  }
};

export default formatSummaryIntoParagraphs;
