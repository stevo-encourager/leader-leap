
// Helper function to clean and extract JSON from OpenAI response
export const cleanJsonResponse = (response: string): string => {
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
  
  return cleaned.trim();
};

// Enhanced function to format summary into proper paragraphs and fix JSON control characters
export const formatSummaryIntoParagraphs = (summary: string): string => {
  if (!summary || summary.trim().length === 0) {
    return "";
  }

  let formatted = summary.replace(/\s+/g, ' ').trim();
  
  const transitionPhrases = [
    'However,', 'At the same time,', 'Additionally,', 'Furthermore,', 'Moreover,',
    'Nevertheless,', 'On the other hand,', 'Meanwhile,', 'In contrast,', 'Similarly,',
    'Consequently,', 'Therefore,', 'Thus,', 'As a result,', 'In addition,',
    'Your results also', 'Your assessment also', 'These results', 'This assessment',
    'Conversely,', 'Nonetheless,', 'Likewise,', 'Subsequently,', 'Alternatively,'
  ];
  
  let splitFound = false;
  for (const phrase of transitionPhrases) {
    const phraseIndex = formatted.indexOf(phrase);
    if (phraseIndex > 50) {
      const firstPart = formatted.substring(0, phraseIndex).trim();
      const secondPart = formatted.substring(phraseIndex).trim();
      
      if (firstPart.length > 30 && secondPart.length > 30) {
        console.log(`Split summary using transition phrase: "${phrase}"`);
        return `${firstPart}\n\n${secondPart}`;
      }
    }
  }
  
  const sentences = formatted.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  
  if (sentences.length >= 4) {
    const midPoint = Math.ceil(sentences.length * 0.6);
    const firstParagraph = sentences.slice(0, midPoint).join(' ').trim();
    const secondParagraph = sentences.slice(midPoint).join(' ').trim();
    
    console.log(`Split summary by sentence count: ${sentences.length} sentences, split at ${midPoint}`);
    return `${firstParagraph}\n\n${secondParagraph}`;
  }
  
  console.log('Summary too short to split, returning as single paragraph');
  return formatted;
};

// Fixed function to properly escape JSON control characters using compatible regex
export const sanitizeJsonString = (jsonString: string): string => {
  try {
    // First attempt to parse - if it works, we're good
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    console.log('JSON parsing failed, attempting to sanitize:', error.message);
    
    // Clean up common control character issues in JSON strings using simple, compatible regex
    let sanitized = jsonString;
    
    // Fix unescaped newlines - find \n that aren't already escaped or at end of string values
    sanitized = sanitized.replace(/\\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\\\\n');
    
    // Fix unescaped carriage returns
    sanitized = sanitized.replace(/\\r(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\\\\r');
    
    // Fix unescaped tabs
    sanitized = sanitized.replace(/\\t(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '\\\\t');
    
    // Fix unescaped backslashes that aren't escape sequences - simple approach
    // Split by quotes to work on string content only
    const parts = sanitized.split('"');
    for (let i = 1; i < parts.length; i += 2) { // Only process string content (odd indices)
      parts[i] = parts[i].replace(/\\(?!["\\/bfnrt])/g, '\\\\');
    }
    sanitized = parts.join('"');
    
    // Try parsing again
    try {
      JSON.parse(sanitized);
      console.log('JSON sanitization successful');
      return sanitized;
    } catch (secondError) {
      console.error('JSON sanitization failed:', secondError.message);
      console.error('Problematic JSON:', sanitized.substring(0, 1000) + '...');
      throw new Error(`Unable to parse JSON after sanitization: ${secondError.message}`);
    }
  }
};
