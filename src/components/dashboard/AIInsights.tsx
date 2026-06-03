
import React from 'react';
import { Bot, AlertCircle, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { useInsights } from '@/hooks/InsightsProvider';
import { FormattedSummary } from '@/components/FormattedSummary';
import type { Category, Demographics } from '@/utils/assessmentTypes';
import { logger } from '@/utils/productionLogger';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
  onRegenerateCallback?: (callback: () => Promise<void>) => void;
}

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resources: string[];
}

interface KeyStrength {
  competency: string;
  example: string;
  leverage_advice: string[];
  resources: string[];
}

interface AIInsightsData {
  summary: string;
  priority_areas: PriorityArea[];
  key_strengths: KeyStrength[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  categories, 
  demographics, 
  averageGap, 
  assessmentId,
  onRegenerateCallback 
}) => {
  const { insights, isLoading, error, regenerateInsights } = useInsights();






  
  // FIXED: Provide the regeneration callback directly to parent
  React.useEffect(() => {
    if (onRegenerateCallback && regenerateInsights) {
      onRegenerateCallback(regenerateInsights);
    }
  }, [onRegenerateCallback, regenerateInsights]);

  // Enhanced parsing function with better error handling
  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      
      // Validate structure
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        logger.error('AIInsights: Invalid insights structure - missing required fields');
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        logger.error('AIInsights: Invalid insights structure - arrays expected');
        return null;
      }

      // Validate priority areas
      for (const area of parsed.priority_areas) {
        if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
          logger.error('AIInsights: Invalid priority area structure:', area);
          return null;
        }
        
        // Ensure insights is an array of strings only
        for (const insight of area.insights) {
          if (typeof insight !== 'string') {
            logger.error('AIInsights: Invalid insight type - must be string:', insight);
            return null;
          }
        }

        // Handle both old 'resource' field and new 'resources' field for backward compatibility
        if (area.resource && !area.resources) {
          area.resources = [area.resource];
        }
        if (!area.resources) {
          area.resources = [];
        }
      }

      // Validate key strengths
      for (const strength of parsed.key_strengths) {
        if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
          logger.error('AIInsights: Invalid key strength structure:', strength);
          return null;
        }
        
        // Ensure leverage_advice is an array of strings only
        for (const advice of strength.leverage_advice) {
          if (typeof advice !== 'string') {
            logger.error('AIInsights: Invalid advice type - must be string:', advice);
            return null;
          }
        }

        // Ensure resources field exists
        if (!strength.resources) {
          strength.resources = [];
        }
      }
      
      return parsed;
    } catch (error) {
      logger.error('AIInsights: Error parsing insights JSON:', error);
      return null;
    }
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

  // Parse resources from markdown format [Name](url) and extract working links only
  const parseResourcesFromText = (resources: string[]): Array<{name: string, url: string}> => {
    const validResources: Array<{name: string, url: string}> = [];
    
    resources.forEach(resource => {
      // Check if it's in markdown format [Name](url)
      const markdownMatch = resource.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (markdownMatch) {
        const name = markdownMatch[1];
        const url = markdownMatch[2];
        const sanitizedUrl = sanitizeUrl(url);
        
        // Only add if URL is valid and sanitized
        if (sanitizedUrl) {
          validResources.push({ name, url: sanitizedUrl });
        }
      }
    });
    
    return validResources;
  };

  // Enhanced helper function to render summary with automatic paragraph formatting and leader links
  const renderFormattedSummary = (summary: string) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 font-quicksand flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Your Assessment Summary
        </h3>
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <FormattedSummary 
            summary={summary}
            className="space-y-4"
          />
        </div>
      </div>
    );
  };

  const renderPriorityAreas = (priorityAreas: PriorityArea[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 font-quicksand  flex items-center gap-2">
        <Target className="h-5 w-5" />
        Your Top 3 Priority Development Areas
      </h3>
      <div className="space-y-6">
        {priorityAreas.map((area, index) => {
          const validResources = parseResourcesFromText(area.resources || []);
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h4 className="text-lg text-slate-800 font-quicksand">
                  {index + 1}. {area.competency}
                </h4>
                <span className="text-sm text-slate-600 bg-white px-2 py-1 rounded">
                  Gap: {area.gap.toFixed(1)}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-slate-700 mb-3 font-quicksand">Suggestions:</h5>
                  <ul className="space-y-3">
                    {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => (
                      <li key={insightIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-encourager text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {insightIndex + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                {validResources.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h6 className="text-slate-700 mb-2 font-quicksand">
                      Recommended Resources:
                    </h6>
                    <div className="space-y-2">
                      {validResources.map((resource, resourceIndex) => (
                        <div key={resourceIndex}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-encourager hover:text-encourager-light text-sm flex items-center gap-1 underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderKeyStrengths = (keyStrengths: KeyStrength[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4 font-quicksand  flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Your Key Competencies to Leverage
      </h3>
      <div className="space-y-6">
        {keyStrengths.map((strength, index) => {
          const validResources = parseResourcesFromText(strength.resources || []);
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h4 className="text-lg text-slate-800 font-quicksand">
                  Competency: {strength.competency}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-slate-700 mb-3 font-quicksand">Existing Skill:</h5>
                  <p className="text-slate-700 leading-relaxed">{strength.example}</p>
                </div>
                <div>
                  <h5 className="text-slate-700 mb-3 font-quicksand">How to leverage further:</h5>
                  <ul className="space-y-3">
                    {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => (
                      <li key={adviceIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-encourager text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {adviceIndex + 1}
                        </span>
                        <p className="text-slate-700 leading-relaxed">{advice}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                {validResources.length > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <h6 className="text-slate-700 mb-2 font-quicksand">
                      Recommended Resources:
                    </h6>
                    <div className="space-y-2">
                      {validResources.map((resource, resourceIndex) => (
                        <div key={resourceIndex}>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-encourager hover:text-encourager-light text-sm flex items-center gap-1 underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-encourager-background p-6 rounded-lg border border-slate-200">
      <div className="space-y-6">

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-encourager">
            <Bot className="robot-spin" size={24} />
            <span className="text-lg">1 minute please, EncouragerGPT is analyzing your test results...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
          <AlertCircle className="text-red-500" size={20} />
          <div>
            <p className="text-red-700 font-medium">Unable to generate insights</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {insights && !isLoading && (
          <div>
            {(() => {
              const parsedInsights = parseInsights(insights);
              
              
              if (!parsedInsights) {
                return (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="mx-auto mb-3" size={40} />
                    <p className="text-lg">Unable to parse AI insights</p>
                    <p className="text-sm">The insights format appears to be invalid. Please try refreshing to regenerate.</p>
                  </div>
                );
              }

              return (
                <div className="prose prose-slate max-w-none">
                  {parsedInsights.summary && renderFormattedSummary(parsedInsights.summary)}
                  {parsedInsights.priority_areas && renderPriorityAreas(parsedInsights.priority_areas)}
                  {parsedInsights.key_strengths && renderKeyStrengths(parsedInsights.key_strengths)}
                </div>
              );
            })()}
          </div>
        )}

        {!insights && !isLoading && !error && (
          <div className="text-center py-8 text-slate-500">
            <Bot className={`mx-auto mb-3 ${isLoading ? 'robot-spin' : ''}`} size={40} />
            <p className="text-lg">AI insights will appear here once your assessment data is analyzed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
