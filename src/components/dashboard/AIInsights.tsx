import React from 'react';
import { Bot, AlertCircle, Target, TrendingUp, ExternalLink } from 'lucide-react';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { FormattedSummary } from '@/components/FormattedSummary';
import { generateResourceLink } from '@/utils/resourceMapping';
import PromptDebugger from './PromptDebugger';

interface AIInsightsProps {
  categories: Category[];
  demographics: Demographics;
  averageGap: number;
  assessmentId?: string;
}

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resource?: string;     // Support both singular
  resources?: string[];  // and plural formats
}

interface KeyStrength {
  competency: string;
  example: string;
  leverage_advice: string[];
}

interface AIInsightsData {
  summary: string;
  priority_areas: PriorityArea[];
  key_strengths: KeyStrength[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ categories, demographics, averageGap, assessmentId }) => {
  const { insights, isLoading, error } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  // Log the assessment ID and insights status for debugging
  React.useEffect(() => {
    console.log('AIInsights: Rendering with assessmentId:', assessmentId);
    console.log('AIInsights: Insights available:', !!insights);
    console.log('AIInsights: Loading state:', isLoading);
    if (insights) {
      console.log('AIInsights: Using insights from database for consistent display');
      console.log('AIInsights: Raw insights text length:', insights.length);
    }
  }, [assessmentId, insights, isLoading]);

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    console.log('AIInsights: Starting to parse insights text:', insightsText?.substring(0, 200) + '...');
    
    try {
      // Clean the text first - remove markdown code blocks if present
      let cleanedText = insightsText.trim();
      
      // Remove markdown code block formatting
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      
      // Remove any extra whitespace
      cleanedText = cleanedText.trim();
      
      console.log('AIInsights: Cleaned text for parsing:', cleanedText?.substring(0, 200) + '...');
      
      const parsed = JSON.parse(cleanedText);
      
      console.log('AIInsights: Successfully parsed JSON:', {
        hasSummary: !!parsed.summary,
        priorityAreasCount: parsed.priority_areas?.length || 0,
        keyStrengthsCount: parsed.key_strengths?.length || 0
      });
      
      // Validate structure
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        console.error('AIInsights: Invalid insights structure - missing required fields');
        console.error('AIInsights: Available fields:', Object.keys(parsed));
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.error('AIInsights: Invalid insights structure - arrays expected');
        console.error('AIInsights: Priority areas type:', typeof parsed.priority_areas);
        console.error('AIInsights: Key strengths type:', typeof parsed.key_strengths);
        return null;
      }

      // Validate priority areas with more flexible resource handling
      for (let i = 0; i < parsed.priority_areas.length; i++) {
        const area = parsed.priority_areas[i];
        console.log(`AIInsights: Validating priority area ${i}:`, {
          hasCompetency: !!area.competency,
          hasInsights: !!area.insights,
          insightsIsArray: Array.isArray(area.insights),
          hasResource: !!area.resource,
          hasResources: !!area.resources,
          hasGap: typeof area.gap === 'number'
        });
        
        if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
          console.error('AIInsights: Invalid priority area structure - missing required fields:', area);
          return null;
        }
        
        // Don't require resource fields anymore - they're optional
        if (!area.resource && !area.resources) {
          console.log('AIInsights: Priority area has no resource field, will use fallback');
          area.resource = "General leadership development";
        }
        
        // Normalize resources to single resource field
        if (area.resources && Array.isArray(area.resources) && area.resources.length > 0) {
          // Take the first resource if it's an array
          area.resource = area.resources[0];
          console.log('AIInsights: Normalized resources array to single resource:', area.resource);
        }
        
        // Ensure insights is an array of strings only
        for (const insight of area.insights) {
          if (typeof insight !== 'string') {
            console.error('AIInsights: Invalid insight type - must be string:', insight);
            return null;
          }
        }
        
        if (typeof area.gap !== 'number') {
          console.error('AIInsights: Invalid gap type - must be number:', area.gap);
          return null;
        }
      }

      // Validate key strengths
      for (let i = 0; i < parsed.key_strengths.length; i++) {
        const strength = parsed.key_strengths[i];
        console.log(`AIInsights: Validating key strength ${i}:`, {
          hasCompetency: !!strength.competency,
          hasExample: !!strength.example,
          hasLeverageAdvice: !!strength.leverage_advice,
          leverageAdviceIsArray: Array.isArray(strength.leverage_advice)
        });
        
        if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
          console.error('AIInsights: Invalid key strength structure:', strength);
          return null;
        }
        
        // Ensure leverage_advice is an array of strings only
        for (const advice of strength.leverage_advice) {
          if (typeof advice !== 'string') {
            console.error('AIInsights: Invalid advice type - must be string:', advice);
            return null;
          }
        }
      }
      
      console.log('AIInsights: Successfully validated all insights data');
      return parsed;
    } catch (error) {
      console.error('AIInsights: Error parsing insights JSON:', error);
      console.error('AIInsights: Raw text that failed to parse:', insightsText);
      return null;
    }
  };

  // Enhanced helper function to render summary with automatic paragraph formatting
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
          // Use the normalized resource field with better fallback handling
          const resourceText = area.resource || (area.resources && area.resources[0]) || 'Leadership development resource';
          const resourceLink = generateResourceLink(resourceText);
          
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
                  <h5 className="text-slate-700 mb-3 font-montserrat">Key insights:</h5>
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
                {resourceText && resourceText !== 'Leadership development resource' && (
                  <div className="bg-slate-50 p-4 rounded border-l-4 border-encourager">
                    <h6 className="text-slate-700 mb-2 font-montserrat">Recommended Resource:</h6>
                    {resourceLink.hasValidLink ? (
                      <a 
                        href={resourceLink.url!} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-encourager hover:text-encourager-light text-sm flex items-center gap-1 underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {resourceLink.title}
                      </a>
                    ) : (
                      <div className="text-slate-600 text-sm">
                        <span className="font-medium">{resourceLink.title}</span>
                        <p className="text-xs text-slate-500 mt-1">Resource link not currently available</p>
                      </div>
                    )}
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
        {keyStrengths.map((strength, index) => (
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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
                    <p className="text-sm">The insights format appears to be invalid. Check the console for detailed error information.</p>
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

        {/* Add the prompt debugger for testing */}
        <PromptDebugger 
          categories={categories}
          demographics={demographics}
          averageGap={averageGap}
          assessmentId={assessmentId}
        />
      </div>
    </div>
  );
};

export default AIInsights;
