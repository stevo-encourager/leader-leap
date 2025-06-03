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

// Simplified function to properly escape JSON control characters using basic operations
export const sanitizeJsonString = (jsonString: string): string => {
  try {
    // First attempt to parse - if it works, we're good
    JSON.parse(jsonString);
    return jsonString;
  } catch (error) {
    console.log('JSON parsing failed, attempting to sanitize:', error.message);
    
    // Use basic string operations to fix common JSON issues
    let sanitized = jsonString;
    
    // Replace control characters with their escaped equivalents
    // Handle common control characters that cause JSON parsing issues
    sanitized = sanitized
      .replace(/\u0000/g, '\\u0000')  // NULL
      .replace(/\u0001/g, '\\u0001')  // SOH
      .replace(/\u0002/g, '\\u0002')  // STX
      .replace(/\u0003/g, '\\u0003')  // ETX
      .replace(/\u0004/g, '\\u0004')  // EOT
      .replace(/\u0005/g, '\\u0005')  // ENQ
      .replace(/\u0006/g, '\\u0006')  // ACK
      .replace(/\u0007/g, '\\u0007')  // BEL
      .replace(/\u0008/g, '\\b')      // BS (backspace)
      .replace(/\u0009/g, '\\t')      // HT (tab)
      .replace(/\u000A/g, '\\n')      // LF (line feed)
      .replace(/\u000B/g, '\\u000B')  // VT
      .replace(/\u000C/g, '\\f')      // FF (form feed)
      .replace(/\u000D/g, '\\r')      // CR (carriage return)
      .replace(/\u000E/g, '\\u000E')  // SO
      .replace(/\u000F/g, '\\u000F')  // SI
      .replace(/\u0010/g, '\\u0010')  // DLE
      .replace(/\u0011/g, '\\u0011')  // DC1
      .replace(/\u0012/g, '\\u0012')  // DC2
      .replace(/\u0013/g, '\\u0013')  // DC3
      .replace(/\u0014/g, '\\u0014')  // DC4
      .replace(/\u0015/g, '\\u0015')  // NAK
      .replace(/\u0016/g, '\\u0016')  // SYN
      .replace(/\u0017/g, '\\u0017')  // ETB
      .replace(/\u0018/g, '\\u0018')  // CAN
      .replace(/\u0019/g, '\\u0019')  // EM
      .replace(/\u001A/g, '\\u001A')  // SUB
      .replace(/\u001B/g, '\\u001B')  // ESC
      .replace(/\u001C/g, '\\u001C')  // FS
      .replace(/\u001D/g, '\\u001D')  // GS
      .replace(/\u001E/g, '\\u001E')  // RS
      .replace(/\u001F/g, '\\u001F'); // US
    
    // Fix unescaped quotes in JSON strings (basic approach)
    // This is a simple pattern that should work everywhere
    sanitized = sanitized.replace(/([^\\])"/g, '$1\\"');
    
    // Fix any remaining unescaped backslashes (simple pattern)
    sanitized = sanitized.replace(/\\([^"\\\/bfnrt])/g, '\\\\$1');
    
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
