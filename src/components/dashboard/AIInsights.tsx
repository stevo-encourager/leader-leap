
import React from 'react';
import { Bot, AlertCircle, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { FormattedSummary } from '@/components/FormattedSummary';
import { generateResourceLink } from '@/utils/resourceMapping';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
  onRegenerateCallback?: (callback: () => Promise<void>) => void;
  showDebugInfo?: boolean; // New prop to control debug visibility
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
  onRegenerateCallback,
  showDebugInfo = false // Default to false for production use
}) => {
  console.log('🔵 AIInsights: Component re-rendered with assessmentId:', assessmentId);
  
  // Add debug state for tracking regeneration
  const [debugInfo, setDebugInfo] = React.useState({
    lastBackendResponse: '',
    lastInsightsPreview: '',
    regenerationCount: 0,
    lastCallbackUpdate: '',
    callbackInvocations: 0
  });
  
  const { insights, isLoading, error, regenerateInsights } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  // Helper function to log assessment data that gets sent to the Edge Function
  const logAssessmentData = React.useCallback(() => {
    if (categories && demographics) {
      console.log('🔍 ASSESSMENT DATA BEING SENT TO EDGE FUNCTION:');
      console.log('📊 Categories:', JSON.stringify(categories, null, 2));
      console.log('👤 Demographics:', JSON.stringify(demographics, null, 2));
      console.log('📈 Average Gap:', averageGap);
      console.log('🆔 Assessment ID:', assessmentId);
      
      // Calculate category gaps and build the exact same assessment data that gets sent to the Edge Function
      const categoriesWithGaps = categories.map(category => {
        // Calculate the category gap from its skills
        const categoryGap = category.skills.reduce((sum, skill) => {
          if (skill.ratings && typeof skill.ratings.current === 'number' && typeof skill.ratings.desired === 'number') {
            return sum + (skill.ratings.desired - skill.ratings.current);
          }
          return sum;
        }, 0) / Math.max(category.skills.length, 1);
        
        return {
          title: category.title,
          gap: categoryGap || 0,
        };
      });
      
      const assessmentData = {
        categories: categoriesWithGaps,
        demographics: {
          role: demographics?.role || null,
          industry: demographics?.industry || null,
          experience: demographics?.yearsOfExperience || null, // Use the correct property name that exists
          teamSize: demographics?.teamSize || null,
        },
        averageGap: averageGap,
      };
      
      console.log('📦 EXACT ASSESSMENT DATA OBJECT SENT TO EDGE FUNCTION:', JSON.stringify(assessmentData, null, 2));
    }
  }, [categories, demographics, averageGap, assessmentId]);

  // Track when insights change to update debug info
  React.useEffect(() => {
    if (insights && insights.length > 0) {
      const timestamp = new Date().toISOString().slice(11, 23);
      const preview = insights.substring(0, 100) + (insights.length > 100 ? '...' : '');
      
      console.log('🔵 AIInsights: Insights updated, setting debug info');
      setDebugInfo(prev => ({
        ...prev,
        lastBackendResponse: `${timestamp} - Response received`,
        lastInsightsPreview: preview
      }));
    }
  }, [insights]);

  // Create wrapper that calls regenerateInsights and updates debug info
  const handleRegenerateWrapper = React.useCallback(async () => {
    console.log('🔵 AIInsights: handleRegenerateWrapper called - FRESH CALLBACK');
    console.log('🔵 AIInsights: regenerateInsights available:', !!regenerateInsights);
    console.log('🔵 AIInsights: regenerateInsights type:', typeof regenerateInsights);
    
    // CRITICAL: Log assessment data BEFORE regeneration
    logAssessmentData();
    
    const timestamp = new Date().toISOString().slice(11, 23);
    setDebugInfo(prev => ({
      ...prev,
      lastBackendResponse: `${timestamp} - Regeneration started`,
      lastInsightsPreview: 'Waiting for new insights...',
      regenerationCount: prev.regenerationCount + 1,
      callbackInvocations: prev.callbackInvocations + 1
    }));

    if (regenerateInsights && typeof regenerateInsights === 'function') {
      console.log('🔵 AIInsights: Calling regenerateInsights function');
      try {
        await regenerateInsights();
        console.log('🔵 AIInsights: regenerateInsights completed successfully');
      } catch (error) {
        console.error('🔵 AIInsights: regenerateInsights failed:', error);
        const errorTimestamp = new Date().toISOString().slice(11, 23);
        setDebugInfo(prev => ({
          ...prev,
          lastBackendResponse: `${errorTimestamp} - Error: ${error}`,
          lastInsightsPreview: 'Error occurred'
        }));
      }
    } else {
      console.error('🔵 AIInsights: regenerateInsights function not available or not a function');
      console.error('🔵 AIInsights: regenerateInsights value:', regenerateInsights);
    }
  }, [regenerateInsights, logAssessmentData]);

  // Provide the wrapper function to parent component
  React.useEffect(() => {
    if (onRegenerateCallback && typeof onRegenerateCallback === 'function') {
      const timestamp = new Date().toISOString().slice(11, 23);
      console.log('🔵 AIInsights: Providing regeneration callback to parent');
      console.log('🔵 AIInsights: handleRegenerateWrapper type:', typeof handleRegenerateWrapper);
      
      setDebugInfo(prev => ({
        ...prev,
        lastCallbackUpdate: `${timestamp} - Callback provided to parent`
      }));
      
      onRegenerateCallback(handleRegenerateWrapper);
    } else {
      console.log('🔵 AIInsights: No onRegenerateCallback provided or not a function');
    }
  }, [onRegenerateCallback, handleRegenerateWrapper]);

  // Log the assessment ID and insights status for debugging
  React.useEffect(() => {
    console.log('🔵 AIInsights: useEffect triggered - assessmentId:', assessmentId);
    console.log('🔵 AIInsights: Current state:', {
      hasInsights: !!insights,
      isLoading,
      hasError: !!error,
      insightsLength: insights?.length || 0
    });
  }, [assessmentId, insights, isLoading, error]);

  // Parse insights from JSON string
  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        console.error('AIInsights: Invalid insights structure - missing required fields');
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.error('AIInsights: Invalid insights structure - arrays expected');
        return null;
      }

      for (const area of parsed.priority_areas) {
        if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
          console.error('AIInsights: Invalid priority area structure:', area);
          return null;
        }
        
        for (const insight of area.insights) {
          if (typeof insight !== 'string') {
            console.error('AIInsights: Invalid insight type - must be string:', insight);
            return null;
          }
        }

        if (area.resource && !area.resources) {
          area.resources = [area.resource];
        }
        if (!area.resources) {
          area.resources = [];
        }
      }

      for (const strength of parsed.key_strengths) {
        if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
          console.error('AIInsights: Invalid key strength structure:', strength);
          return null;
        }
        
        for (const advice of strength.leverage_advice) {
          if (typeof advice !== 'string') {
            console.error('AIInsights: Invalid advice type - must be string:', advice);
            return null;
          }
        }

        if (!strength.resources) {
          strength.resources = [];
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('AIInsights: Error parsing insights JSON:', error);
      return null;
    }
  };

  // Parse resources from markdown format [Name](url) and extract working links only
  const parseResourcesFromText = (resources: string[]): Array<{name: string, url: string}> => {
    const validResources: Array<{name: string, url: string}> = [];
    
    resources.forEach(resource => {
      const markdownMatch = resource.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (markdownMatch) {
        const name = markdownMatch[1];
        const url = markdownMatch[2];
        
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          validResources.push({ name, url });
        }
      } else {
        const resourceLink = generateResourceLink(resource);
        if (resourceLink.hasValidLink && resourceLink.url) {
          validResources.push({ 
            name: resourceLink.title, 
            url: resourceLink.url 
          });
        }
      }
    });
    
    return validResources;
  };

  // Enhanced helper function to render summary with automatic paragraph formatting and leader links
  const renderFormattedSummary = (summary: string) => {
    return (
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-encourager mb-3 font-montserrat">Assessment Summary</h3>
        <FormattedSummary 
          summary={summary}
          className="space-y-4"
        />
      </div>
    );
  };

  const renderPriorityAreas = (priorityAreas: PriorityArea[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-encourager mb-4 font-montserrat border-b border-encourager/20 pb-2 flex items-center gap-2">
        <Target className="h-5 w-5" />
        Top 3 Priority Development Areas
      </h3>
      <div className="space-y-6">
        {priorityAreas.map((area, index) => {
          const validResources = parseResourcesFromText(area.resources || []);
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h4 className="text-lg text-slate-800 font-montserrat">
                  {index + 1}. {area.competency}
                </h4>
                <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  Gap: {area.gap.toFixed(1)}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-slate-700 mb-3 font-montserrat">Suggestions:</h5>
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
                  <div className="bg-slate-50 p-4 rounded border-l-4 border-encourager">
                    <h6 className="text-slate-700 mb-2 font-montserrat">
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
      <h3 className="text-xl font-bold text-encourager mb-4 font-montserrat border-b border-encourager/20 pb-2 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Key Competencies to Leverage
      </h3>
      <div className="space-y-6">
        {keyStrengths.map((strength, index) => {
          const validResources = parseResourcesFromText(strength.resources || []);
          
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h4 className="text-lg text-slate-800 font-montserrat">
                  Competency: {strength.competency}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-slate-700 mb-3 font-montserrat">Existing Skill:</h5>
                  <p className="text-slate-700 leading-relaxed">{strength.example}</p>
                </div>
                <div>
                  <h5 className="text-slate-700 mb-3 font-montserrat">How to leverage further:</h5>
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
                  <div className="bg-slate-50 p-4 rounded border-l-4 border-encourager">
                    <h6 className="text-slate-700 mb-2 font-montserrat">
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
    <div className="space-y-6">
      {/* DEBUG INDICATOR - ONLY VISIBLE IN TEST PANEL */}
      {showDebugInfo && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h4 className="font-bold text-red-800 mb-2">DEBUG INFO (Test Panel Only)</h4>
          <div className="text-sm text-red-700 space-y-1">
            <div><strong>Regeneration Count:</strong> {debugInfo.regenerationCount}</div>
            <div><strong>Callback Invocations:</strong> {debugInfo.callbackInvocations}</div>
            <div><strong>Last Callback Update:</strong> {debugInfo.lastCallbackUpdate || 'None'}</div>
            <div><strong>Last Backend Response:</strong> {debugInfo.lastBackendResponse || 'None'}</div>
            <div><strong>Latest Insights Preview:</strong> {debugInfo.lastInsightsPreview || 'None'}</div>
            <div><strong>Current Loading State:</strong> {isLoading ? 'LOADING' : 'NOT LOADING'}</div>
            <div><strong>Has Insights:</strong> {insights ? 'YES' : 'NO'}</div>
            <div><strong>Has Error:</strong> {error ? 'YES' : 'NO'}</div>
            <div><strong>Has RegenerateInsights Function:</strong> {regenerateInsights ? 'YES' : 'NO'}</div>
          </div>
        </div>
      )}

      {/* AI-Powered Insights Header */}
      <div className="bg-encourager/5 p-6 rounded-lg border border-encourager/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-encourager-accent/20 p-3 rounded-full">
              <Bot className="text-encourager" size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-encourager font-playfair">AI-Powered Insights</h2>
              <p className="text-sm text-slate-600 mt-1">
                Personalized leadership development insights powered by EncouragerGPT
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-encourager">
              <Bot className="animate-pulse" size={24} />
              <span className="text-lg">EncouragerGPT is analyzing your assessment results...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="text-red-700 font-medium">Unable to generate insights</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {insights && !isLoading && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
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
            <Bot className="mx-auto mb-3" size={40} />
            <p className="text-lg">AI insights will appear here once your assessment data is analyzed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
