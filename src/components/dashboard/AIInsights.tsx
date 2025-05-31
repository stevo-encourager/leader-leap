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
}

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resource?: string;
  resources?: string[];
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
    }
  }, [assessmentId, insights, isLoading]);

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    console.log('=== PARSING INSIGHTS DEBUG ===');
    console.log('Raw insightsText received:', insightsText);
    console.log('insightsText type:', typeof insightsText);
    console.log('insightsText length:', insightsText?.length || 0);
    console.log('First 200 characters:', insightsText?.substring(0, 200));
    console.log('Last 200 characters:', insightsText?.substring(insightsText.length - 200));

    try {
      let cleanedText = insightsText;

      // Handle potential markdown code block formatting
      if (cleanedText.includes('```json')) {
        console.log('Found markdown JSON code block, extracting...');
        const jsonMatch = cleanedText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedText = jsonMatch[1].trim();
          console.log('Extracted JSON from markdown:', cleanedText.substring(0, 200));
        }
      } else if (cleanedText.includes('```')) {
        console.log('Found generic code block, extracting...');
        const codeMatch = cleanedText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          cleanedText = codeMatch[1].trim();
          console.log('Extracted content from code block:', cleanedText.substring(0, 200));
        }
      }

      // Remove any leading/trailing whitespace and non-JSON characters
      cleanedText = cleanedText.trim();
      
      // Remove any text before the opening brace
      const openBraceIndex = cleanedText.indexOf('{');
      if (openBraceIndex > 0) {
        console.log('Removing text before opening brace');
        cleanedText = cleanedText.substring(openBraceIndex);
      }

      // Remove any text after the closing brace
      const closeBraceIndex = cleanedText.lastIndexOf('}');
      if (closeBraceIndex !== -1 && closeBraceIndex < cleanedText.length - 1) {
        console.log('Removing text after closing brace');
        cleanedText = cleanedText.substring(0, closeBraceIndex + 1);
      }

      console.log('Cleaned text for parsing:', cleanedText.substring(0, 200));

      const parsed = JSON.parse(cleanedText);
      console.log('Successfully parsed JSON:', {
        hasSummary: !!parsed.summary,
        priorityAreasCount: parsed.priority_areas?.length || 0,
        keyStrengthsCount: parsed.key_strengths?.length || 0
      });
      
      // Validate structure
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        console.error('AIInsights: Invalid insights structure - missing required fields');
        console.error('Missing fields:', {
          summary: !parsed.summary,
          priority_areas: !parsed.priority_areas,
          key_strengths: !parsed.key_strengths
        });
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.error('AIInsights: Invalid insights structure - arrays expected');
        console.error('Field types:', {
          priority_areas: typeof parsed.priority_areas,
          key_strengths: typeof parsed.key_strengths
        });
        return null;
      }

      // Validate priority areas
      for (let i = 0; i < parsed.priority_areas.length; i++) {
        const area = parsed.priority_areas[i];
        console.log(`Validating priority area ${i + 1}:`, {
          hasCompetency: !!area.competency,
          hasInsights: !!area.insights,
          insightsIsArray: Array.isArray(area.insights),
          hasResource: !!area.resource,
          hasResources: !!area.resources,
          insightsLength: area.insights?.length || 0
        });

        if (!area.competency || !area.insights || !Array.isArray(area.insights)) {
          console.error(`AIInsights: Invalid priority area ${i + 1} structure:`, area);
          return null;
        }
        
        // Accept either 'resource' or 'resources' field for backward compatibility
        if (!area.resource && !area.resources) {
          console.error(`AIInsights: Priority area ${i + 1} missing resource field:`, area);
          return null;
        }
        
        // Ensure insights is an array of strings only
        for (let j = 0; j < area.insights.length; j++) {
          const insight = area.insights[j];
          if (typeof insight !== 'string') {
            console.error(`AIInsights: Invalid insight type in area ${i + 1}, insight ${j + 1} - must be string:`, insight);
            return null;
          }
        }
      }

      // Validate key strengths
      for (let i = 0; i < parsed.key_strengths.length; i++) {
        const strength = parsed.key_strengths[i];
        console.log(`Validating key strength ${i + 1}:`, {
          hasCompetency: !!strength.competency,
          hasExample: !!strength.example,
          hasLeverageAdvice: !!strength.leverage_advice,
          leverageAdviceIsArray: Array.isArray(strength.leverage_advice),
          leverageAdviceLength: strength.leverage_advice?.length || 0
        });

        if (!strength.competency || !strength.example || !strength.leverage_advice || !Array.isArray(strength.leverage_advice)) {
          console.error(`AIInsights: Invalid key strength ${i + 1} structure:`, strength);
          return null;
        }
        
        // Ensure leverage_advice is an array of strings only
        for (let j = 0; j < strength.leverage_advice.length; j++) {
          const advice = strength.leverage_advice[j];
          if (typeof advice !== 'string') {
            console.error(`AIInsights: Invalid advice type in strength ${i + 1}, advice ${j + 1} - must be string:`, advice);
            return null;
          }
        }
      }

      console.log('=== VALIDATION PASSED ===');
      return parsed;
    } catch (error) {
      console.error('=== JSON PARSING ERROR ===');
      console.error('Error parsing insights JSON:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Log the problematic text around the error location if available
      if (error.message.includes('position')) {
        const positionMatch = error.message.match(/position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1]);
          const start = Math.max(0, position - 50);
          const end = Math.min(insightsText.length, position + 50);
          console.error('Text around error position:', insightsText.substring(start, end));
        }
      }
      
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
          // Handle both 'resource' and 'resources' fields
          const resourceToUse = area.resource || (Array.isArray(area.resources) ? area.resources[0] : area.resources);
          const resourceLink = generateResourceLink(resourceToUse || '');
          
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
                {resourceToUse && (
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
                    <p className="text-sm">The insights format appears to be invalid. Please check the console for detailed error information and try refreshing to regenerate.</p>
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
