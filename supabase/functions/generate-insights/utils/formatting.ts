
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

// Simple function to sanitize JSON strings using only basic string replacement
export const sanitizeJsonString = (jsonString: string): string => {
  try {
    // First attempt to parse - if it works, we're good
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    console.log('JSON parsing failed, attempting to sanitize:', error.message);
    
    // Use simple string replacement for common control characters
    let sanitized = jsonString;
    
    // Replace common control characters with their escaped equivalents
    sanitized = sanitized.replace(/\u0000/g, '\\u0000');  // NULL
    sanitized = sanitized.replace(/\u0001/g, '\\u0001');  // SOH
    sanitized = sanitized.replace(/\u0002/g, '\\u0002');  // STX
    sanitized = sanitized.replace(/\u0003/g, '\\u0003');  // ETX
    sanitized = sanitized.replace(/\u0004/g, '\\u0004');  // EOT
    sanitized = sanitized.replace(/\u0005/g, '\\u0005');  // ENQ
    sanitized = sanitized.replace(/\u0006/g, '\\u0006');  // ACK
    sanitized = sanitized.replace(/\u0007/g, '\\u0007');  // BEL
    sanitized = sanitized.replace(/\u0008/g, '\\b');      // BS (backspace)
    sanitized = sanitized.replace(/\u0009/g, '\\t');      // HT (tab)
    sanitized = sanitized.replace(/\u000A/g, '\\n');      // LF (line feed)
    sanitized = sanitized.replace(/\u000B/g, '\\u000B');  // VT
    sanitized = sanitized.replace(/\u000C/g, '\\f');      // FF (form feed)
    sanitized = sanitized.replace(/\u000D/g, '\\r');      // CR (carriage return)
    sanitized = sanitized.replace(/\u000E/g, '\\u000E');  // SO
    sanitized = sanitized.replace(/\u000F/g, '\\u000F');  // SI
    sanitized = sanitized.replace(/\u0010/g, '\\u0010');  // DLE
    sanitized = sanitized.replace(/\u0011/g, '\\u0011');  // DC1
    sanitized = sanitized.replace(/\u0012/g, '\\u0012');  // DC2
    sanitized = sanitized.replace(/\u0013/g, '\\u0013');  // DC3
    sanitized = sanitized.replace(/\u0014/g, '\\u0014');  // DC4
    sanitized = sanitized.replace(/\u0015/g, '\\u0015');  // NAK
    sanitized = sanitized.replace(/\u0016/g, '\\u0016');  // SYN
    sanitized = sanitized.replace(/\u0017/g, '\\u0017');  // ETB
    sanitized = sanitized.replace(/\u0018/g, '\\u0018');  // CAN
    sanitized = sanitized.replace(/\u0019/g, '\\u0019');  // EM
    sanitized = sanitized.replace(/\u001A/g, '\\u001A');  // SUB
    sanitized = sanitized.replace(/\u001B/g, '\\u001B');  // ESC
    sanitized = sanitized.replace(/\u001C/g, '\\u001C');  // FS
    sanitized = sanitized.replace(/\u001D/g, '\\u001D');  // GS
    sanitized = sanitized.replace(/\u001E/g, '\\u001E');  // RS
    sanitized = sanitized.replace(/\u001F/g, '\\u001F');  // US
    
    // Handle unescaped quotes by replacing quote characters preceded by non-backslash
    // Split and rejoin to avoid regex lookahead/lookbehind
    const parts = sanitized.split('');
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] === '"' && parts[i - 1] !== '\\') {
        parts[i] = '\\"';
      }
    }
    sanitized = parts.join('');
    
    // Handle unescaped backslashes - replace single backslashes that aren't escape sequences
    let result = '';
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if (char === '\\' && i + 1 < sanitized.length) {
        const nextChar = sanitized[i + 1];
        if (nextChar !== '"' && nextChar !== '\\' && nextChar !== '/' && 
            nextChar !== 'b' && nextChar !== 'f' && nextChar !== 'n' && 
            nextChar !== 'r' && nextChar !== 't' && nextChar !== 'u') {
          result += '\\\\';
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }
    sanitized = result;
    
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
