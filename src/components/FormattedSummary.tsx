
import React from 'react';
import { ExternalLink } from 'lucide-react';

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

  // Sanitize URL to prevent XSS attacks
  const sanitizeUrl = (url: string): string | null => {
    try {
      // Only allow http/https URLs
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return null;
      }
      
      // Parse and validate URL structure
      const parsedUrl = new URL(url);
      
      // Block dangerous protocols and suspicious patterns
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }
      
      // Block javascript: data: and other dangerous schemes
      if (url.toLowerCase().includes('javascript:') || 
          url.toLowerCase().includes('data:') ||
          url.toLowerCase().includes('vbscript:')) {
        return null;
      }
      
      return parsedUrl.href;
    } catch (error) {
      // Invalid URL
      return null;
    }
  };

  // Decode HTML entities that may come from AI responses
  const decodeHtmlEntities = (text: string): string => {
    const htmlEntities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/',
      '&#39;': "'"
    };
    
    return text.replace(/&(amp|lt|gt|quot|#x27|#x2F|#39);/g, (match) => htmlEntities[match] || match);
  };

  // Escape dangerous characters while preserving decoded entities
  const sanitizeText = (text: string): string => {
    // First decode any existing HTML entities
    const decoded = decodeHtmlEntities(text);
    
    // Only escape characters that could be dangerous, but avoid double-encoding
    return decoded.replace(/<script|<iframe|javascript:|data:/gi, '');
  };

  // Convert HTML anchor tags and markdown links to React elements with security validation
  const renderTextWithLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Combined regex to match both HTML anchor tags and markdown links
    const combinedRegex = /<a href="([^"]+)">([^<]+)<\/a>|\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the link (sanitized)
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(sanitizeText(beforeText));
      }
      
      if (match[1] && match[2]) {
        // HTML anchor tag format: <a href="url">text</a>
        const linkUrl = match[1];
        const linkText = match[2];
        const sanitizedUrl = sanitizeUrl(linkUrl);
        
        if (sanitizedUrl) {
          parts.push(
            <a
              key={match.index}
              href={sanitizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-encourager hover:text-encourager-light underline inline-flex items-center gap-1"
            >
{sanitizeText(linkText)}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        } else {
          // Render as plain text if URL is invalid/dangerous (escaped)
          parts.push(sanitizeText(linkText));
        }
      } else if (match[3] && match[4]) {
        // Markdown format: [text](url)
        const linkText = match[3];
        const linkUrl = match[4];
        const sanitizedUrl = sanitizeUrl(linkUrl);
        
        if (sanitizedUrl) {
          parts.push(
            <a
              key={match.index}
              href={sanitizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-encourager hover:text-encourager-light underline inline-flex items-center gap-1"
            >
{sanitizeText(linkText)}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        } else {
          // Render as plain text if URL is invalid/dangerous (escaped)
          parts.push(sanitizeText(linkText));
        }
      }
      
      lastIndex = combinedRegex.lastIndex;
    }
    
    // Add remaining text after the last link (sanitized)
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      parts.push(sanitizeText(remainingText));
    }
    
    return parts.length > 0 ? parts : [sanitizeText(text)];
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
