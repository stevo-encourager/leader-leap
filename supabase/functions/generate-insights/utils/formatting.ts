
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

// Enhanced function to sanitize JSON strings by escaping control characters
export const sanitizeJsonString = (jsonString: string): string => {
  console.log('Starting JSON sanitization, original length:', jsonString.length);
  
  try {
    // First attempt to parse - if it works, we're good
    JSON.parse(jsonString);
    console.log('JSON parsing successful on first attempt');
    return jsonString;
  } catch (error) {
    console.log('JSON parsing failed, attempting to sanitize control characters:', error.message);
    
    // Sanitize control characters using simple iteration through each character
    let sanitized = '';
    let insideString = false;
    let escapeNext = false;
    
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];
      const charCode = char.charCodeAt(0);
      
      if (escapeNext) {
        sanitized += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        sanitized += char;
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        insideString = !insideString;
        sanitized += char;
        continue;
      }
      
      // If we're inside a string and encounter a control character (0-31), escape it
      if (insideString && charCode >= 0 && charCode <= 31) {
        switch (charCode) {
          case 8:
            sanitized += '\\b';
            break;
          case 9:
            sanitized += '\\t';
            break;
          case 10:
            sanitized += '\\n';
            break;
          case 12:
            sanitized += '\\f';
            break;
          case 13:
            sanitized += '\\r';
            break;
          default:
            // Convert to unicode escape sequence
            const hex = charCode.toString(16).padStart(4, '0');
            sanitized += `\\u${hex}`;
            break;
        }
      } else {
        sanitized += char;
      }
    }
    
    console.log('Control character sanitization completed, new length:', sanitized.length);
    console.log('Sanitized JSON sample (first 500 chars):', sanitized.substring(0, 500));
    
    // Try parsing again
    try {
      JSON.parse(sanitized);
      console.log('JSON sanitization successful');
      return sanitized;
    } catch (secondError) {
      console.error('JSON sanitization failed:', secondError.message);
      console.error('Problematic JSON sample:', sanitized.substring(0, 1000));
      throw new Error(`Unable to parse JSON after sanitization: ${secondError.message}`);
    }
  }
};
