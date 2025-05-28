
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import SkillGapChart from '../SkillGapChart';
import RecommendedSteps from '../dashboard/RecommendedSteps';
import CoachingSupport from '../dashboard/CoachingSupport';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';
import { FormattedSummary } from '@/components/FormattedSummary';
import { generateResourceLink } from '@/utils/resourceMapping';

interface PDFTemplateProps {
  categories: Category[];
  demographics: Demographics;
  assessmentId?: string;
}

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resource: string;
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

// Actual Base64 encoded logo - using a simple black rectangle as a test logo
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAYAAAA8AQ3AAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QwYCgcVHwJY1AAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAApSURBVHja7cExAQAAAMKg9U9tBn+gAAAAAAAAAAAAAAAAAAAAAAAA4GYNcAABjPgkBwAAAABJRU5ErkJggg==";

const PDFTemplate: React.FC<PDFTemplateProps> = ({ categories, demographics, assessmentId }) => {
  const timestamp = new Date().toISOString();
  console.log('=== PDF TEMPLATE DEBUG START ===');
  console.log(`PDFTemplate: Component rendering at ${timestamp}`);
  console.log('PDFTemplate: categories length:', categories?.length || 0);
  console.log('PDFTemplate: assessmentId:', assessmentId);
  
  // Enhanced validation with detailed logging
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    console.error('PDFTemplate: Invalid categories data');
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>PDF Template Error</h1>
        <p>No valid assessment data provided</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    );
  }
  
  // Calculate metrics
  const averageGap = calculateAverageGap(categories);
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use the OpenAI insights hook
  const { insights, isLoading, error } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      
      // Validate structure
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        console.error('PDFTemplate: Invalid insights structure - missing required fields');
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.error('PDFTemplate: Invalid insights structure - arrays expected');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('PDFTemplate: Error parsing insights JSON:', error);
      return null;
    }
  };

  console.log('PDFTemplate: Metrics calculated:', {
    averageGap
  });
  console.log('=== PDF TEMPLATE DEBUG END ===');

  return (
    <div 
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#1f2937',
        backgroundColor: 'white',
        margin: '0',
        padding: '0',
        maxWidth: '190mm',
        width: '100%',
        minHeight: '297mm',
        boxSizing: 'border-box'
      }}
      data-insights={insights || ''}
    >
      {/* Logo at the absolute top - FIRST element with no containers */}
      <img 
        src={LOGO_BASE64}
        alt="Company Logo" 
        style={{
          maxWidth: '200px',
          maxHeight: '60px',
          display: 'block',
          margin: '0 auto'
        }}
      />

      {/* Header - Page 1 content */}
      <div style={{ margin: '0', padding: '0' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0', 
          textAlign: 'center' 
        }}>
          Leadership Assessment Results
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 8px 0', padding: '0' }}>
          Generated on {currentDate}
        </p>
      </div>

      {/* Profile Summary */}
      <div style={{ margin: '8px 0', padding: '0' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0 0 12px 0', 
          borderBottom: '2px solid #2F564D' 
        }}>
          Profile Summary
        </h2>
        {demographics?.role && (
          <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
            <strong>Role:</strong> {demographics.role}
          </p>
        )}
        {demographics?.yearsOfExperience && (
          <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
            <strong>Years of Experience:</strong> {demographics.yearsOfExperience}
          </p>
        )}
        {demographics?.industry && (
          <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
            <strong>Industry:</strong> {demographics.industry}
          </p>
        )}
        <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
          <strong>Overall Development Gap:</strong> {averageGap.toFixed(2)} points
        </p>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
          Assessment completed across {categories.length} competency areas
        </p>
      </div>

      {/* Competency Gap Chart */}
      <div style={{ margin: '8px 0', padding: '0' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0 0 12px 0', 
          borderBottom: '2px solid #2F564D' 
        }}>
          Competency Analysis - Radar Chart
        </h2>
        <div style={{ 
          height: '400px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          overflow: 'visible',
          margin: '0',
          padding: '0'
        }}>
          <div style={{ width: '100%', height: '100%' }} id="pdf-radar-chart-container">
            <SkillGapChart categories={categories} isPDF={true} />
          </div>
        </div>
        
        {/* PAGE BREAK: Place as the ABSOLUTE LAST element of chart section with NO trailing content */}
        <div style={{ 
          pageBreakBefore: 'always', 
          breakBefore: 'page', 
          margin: '0', 
          padding: '0', 
          height: '0', 
          display: 'block' 
        }}></div>
      </div>

      {/* AI Insights section */}
      <div style={{ margin: '0', padding: '0' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0 0 12px 0', 
          borderBottom: '2px solid #2F564D' 
        }}>
          AI-Powered Insights
        </h2>
        <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 8px 0', padding: '0' }}>
          Personalized leadership development insights powered by Encourager GPT
        </p>
        
        {isLoading && (
          <p style={{ margin: '8px 0', padding: '0' }}>Encourager GPT is analyzing your assessment results...</p>
        )}

        {error && (
          <div style={{ margin: '8px 0', padding: '0' }}>
            <p><strong>Unable to generate insights:</strong> {error}</p>
          </div>
        )}

        {insights && !isLoading && (() => {
          const parsedInsights = parseInsights(insights);
          
          if (!parsedInsights) {
            return (
              <p style={{ margin: '8px 0', padding: '0' }}>
                Unable to parse AI insights. The insights format appears to be invalid.
              </p>
            );
          }

          return (
            <div style={{ margin: '0', padding: '0' }}>
              {/* Assessment Summary */}
              {parsedInsights.summary && (
                <div style={{ margin: '8px 0', padding: '0' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2F564D', 
                    margin: '8px 0 4px 0', 
                    padding: '0' 
                  }}>
                    Assessment Summary
                  </h3>
                  <FormattedSummary 
                    summary={parsedInsights.summary}
                    className=""
                  />
                </div>
              )}

              {/* Priority Development Areas */}
              {parsedInsights.priority_areas && (
                <div style={{ margin: '8px 0', padding: '0' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2F564D', 
                    margin: '8px 0 4px 0', 
                    padding: '0' 
                  }}>
                    Top 3 Priority Development Areas
                  </h3>
                  {parsedInsights.priority_areas.map((area, index) => {
                    const resourceLink = generateResourceLink(area.resource);
                    
                    return (
                      <div key={index} style={{ margin: '6px 0', padding: '0' }}>
                        <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                          <span style={{ fontWeight: '600', color: '#2F564D' }}>
                            {index + 1}. {area.competency}
                          </span>
                          <span style={{ fontWeight: '600', color: '#dc2626', marginLeft: '6px' }}>
                            (Gap: {area.gap.toFixed(1)})
                          </span>
                        </p>
                        
                        <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                          <strong>Key insights:</strong>
                        </p>
                        <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                          {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => (
                            <li key={insightIndex} style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                              {insight}
                            </li>
                          ))}
                        </ul>
                        
                        {area.resource && (
                          <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                            <strong>Recommended Resource:</strong> {resourceLink.title}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Key Competencies to Leverage */}
              {parsedInsights.key_strengths && (
                <div style={{ margin: '8px 0', padding: '0' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#2F564D', 
                    margin: '8px 0 4px 0', 
                    padding: '0' 
                  }}>
                    Key Competencies to Leverage
                  </h3>
                  {parsedInsights.key_strengths.map((strength, index) => (
                    <div key={index} style={{ margin: '6px 0', padding: '0' }}>
                      <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                        <strong>Competency:</strong> {strength.competency}
                      </p>
                      <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                        <strong>Existing Skill:</strong> {strength.example}
                      </p>
                      <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
                        <strong>How to leverage further:</strong>
                      </p>
                      <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
                        {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => (
                          <li key={adviceIndex} style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                            {advice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {!insights && !isLoading && !error && (
          <p style={{ margin: '8px 0', padding: '0' }}>
            AI insights will appear here once your assessment data is analyzed.
          </p>
        )}
      </div>

      {/* Recommended Next Steps */}
      <div style={{ margin: '8px 0', padding: '0' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0 0 12px 0', 
          borderBottom: '2px solid #2F564D' 
        }}>
          Recommended Next Steps
        </h2>
        <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
          <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
            Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development
          </li>
          <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
            Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress
          </li>
          <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
            Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step
          </li>
        </ul>
      </div>

      {/* Coaching Support */}
      <div style={{ margin: '8px 0', padding: '0' }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#2F564D', 
          margin: '0 0 8px 0', 
          padding: '0 0 12px 0', 
          borderBottom: '2px solid #2F564D' 
        }}>
          Coaching Support
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          width: '100%',
          margin: '0',
          padding: '0'
        }}>
          <div style={{ width: '100%' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#2F564D', 
              margin: '8px 0 4px 0', 
              padding: '0' 
            }}>
              Professional Development Coaching
            </h3>
            <p style={{ margin: '4px 0', padding: '0', lineHeight: '1.4' }}>
              Ready to take your leadership skills to the next level? Our expert coaches can help you:
            </p>
            <ul style={{ margin: '4px 0', paddingLeft: '18px', listStyleType: 'disc' }}>
              <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                Create personalized development plans
              </li>
              <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                Practice new skills in a safe environment
              </li>
              <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                Overcome specific leadership challenges
              </li>
              <li style={{ margin: '2px 0', padding: '0', lineHeight: '1.4' }}>
                Track your progress over time
              </li>
            </ul>
          </div>
          <div style={{
            textAlign: 'center',
            width: '100%',
            height: '200px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png" 
              alt="Coach Portrait" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                maxHeight: '170px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b',
        paddingTop: '8px',
        margin: '8px 0 0 0'
      }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
          Leadership Assessment Tool • Generated on {currentDate}
        </p>
        <p style={{ margin: '0', lineHeight: '1.4' }}>
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </p>
      </div>
    </div>
  );
};

export default PDFTemplate;
