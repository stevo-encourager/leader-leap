
import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';
import FormattedSummary from '../FormattedSummary';

interface AIInsightsProps {
  insights: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  let parsedInsights;
  
  try {
    parsedInsights = JSON.parse(insights);
  } catch (error) {
    console.error('Failed to parse AI insights:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Unable to display insights. Please try regenerating.</p>
      </div>
    );
  }

  const { summary, priority_areas = [], key_strengths = [] } = parsedInsights;

  return (
    <div className="space-y-8">
      {/* AI Assessment Summary */}
      {summary && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Lightbulb className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">AI Assessment Summary</h3>
          </div>
          <FormattedSummary summary={summary} />
        </div>
      )}

      {/* Top 3 Priority Development Areas */}
      {priority_areas.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-100 p-2 rounded-full">
              <Target className="text-amber-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Top 3 Priority Development Areas</h3>
          </div>
          
          <div className="space-y-6">
            {priority_areas.map((area, index) => (
              <div key={index} className="border-l-4 border-amber-400 pl-4">
                <h4 className="font-semibold text-lg text-slate-800 mb-2">
                  Competency: {area.competency}
                </h4>
                <div className="bg-amber-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-amber-800 font-medium">Gap Score: {area.gap}</p>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-medium text-slate-700">Key Insights:</h5>
                  <ol className="space-y-2">
                    {area.insights?.map((insight, insightIndex) => (
                      <li key={insightIndex} className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center">
                          {insightIndex + 1}
                        </span>
                        <p className="text-slate-600 leading-relaxed">{insight}</p>
                      </li>
                    ))}
                  </ol>
                  
                  {area.resource && (
                    <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="font-medium text-blue-800">Recommended Resource: </span>
                        <span className="text-blue-700">{area.resource}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Strengths to Leverage */}
      {key_strengths.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Key Strengths to Leverage</h3>
          </div>
          
          <div className="space-y-6">
            {key_strengths.map((strength, index) => (
              <div key={index} className="border-l-4 border-green-400 pl-4">
                <h4 className="font-semibold text-lg text-slate-800 mb-2">
                  Competency: {strength.competency}
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">Existing Skill:</h5>
                    <p className="text-green-700 leading-relaxed">{strength.example}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-slate-700 mb-3">How to leverage further:</h5>
                    <ol className="space-y-2">
                      {strength.leverage_advice?.map((advice, adviceIndex) => (
                        <li key={adviceIndex} className="flex items-start gap-3">
                          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[24px] h-6 flex items-center justify-center">
                            {adviceIndex + 1}
                          </span>
                          <p className="text-slate-600 leading-relaxed">{advice}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
