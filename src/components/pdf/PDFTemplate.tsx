
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import SkillGapChart from '../SkillGapChart';
import { useOpenAIInsights } from '@/hooks/useOpenAIInsights';

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

  // Hook for AI insights
  const { insights, isLoading, error } = useOpenAIInsights({
    categories,
    demographics,
    averageGap,
    assessmentId
  });

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      
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
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#1f2937',
      backgroundColor: 'white',
      margin: '0 auto',
      maxWidth: '190mm',
      width: '100%',
      minHeight: '297mm',
      padding: '15mm',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#2F564D',
          fontSize: '26px',
          margin: '0 0 8px 0',
          fontWeight: '700'
        }}>
          Leadership Assessment Results
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: '0'
        }}>
          Generated on {currentDate}
        </p>
      </div>

      {/* Profile Summary */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Profile Summary
        </h2>
        {demographics?.role && (
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            <strong>Role:</strong> {demographics.role}
          </p>
        )}
        {demographics?.yearsOfExperience && (
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            <strong>Years of Experience:</strong> {demographics.yearsOfExperience}
          </p>
        )}
        {demographics?.industry && (
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            <strong>Industry:</strong> {demographics.industry}
          </p>
        )}
        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
          <strong>Overall Development Gap:</strong> {averageGap.toFixed(2)} points
        </p>
        <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>
          Assessment completed across {categories.length} competency areas
        </p>
      </div>

      {/* Competency Gap Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Competency Analysis - Radar Chart
        </h2>
        <div style={{ 
          height: '500px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <SkillGapChart categories={categories} isPDF={true} />
        </div>
      </div>

      {/* AI-Powered Insights - Plain Text */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          AI-Powered Insights
        </h2>
        
        {isLoading && (
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Encourager GPT is analyzing your assessment results...
          </p>
        )}

        {error && (
          <p style={{ fontSize: '14px', color: '#dc2626' }}>
            Unable to generate insights: {error}
          </p>
        )}

        {insights && !isLoading && (
          <div>
            {(() => {
              const parsedInsights = parseInsights(insights);
              
              if (!parsedInsights) {
                return (
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Unable to parse AI insights. The insights format appears to be invalid.
                  </p>
                );
              }

              return (
                <div>
                  {/* Assessment Summary */}
                  {parsedInsights.summary && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{
                        color: '#2F564D',
                        fontSize: '16px',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Assessment Summary
                      </h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', margin: '0' }}>
                        {parsedInsights.summary}
                      </p>
                    </div>
                  )}

                  {/* Top 3 Priority Development Areas */}
                  {parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{
                        color: '#2F564D',
                        fontSize: '16px',
                        marginBottom: '12px',
                        fontWeight: '600'
                      }}>
                        Top 3 Priority Development Areas
                      </h3>
                      {parsedInsights.priority_areas.map((area, index) => (
                        <div key={index} style={{ marginBottom: '16px' }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            margin: '0 0 4px 0'
                          }}>
                            {index + 1}. {area.competency} (Gap: {area.gap.toFixed(1)})
                          </h4>
                          <p style={{ fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>
                            Key insights:
                          </p>
                          <ul style={{ 
                            listStyleType: 'disc', 
                            paddingLeft: '20px', 
                            margin: '0 0 8px 0',
                            fontSize: '14px'
                          }}>
                            {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => (
                              <li key={insightIndex} style={{ marginBottom: '4px' }}>
                                {insight}
                              </li>
                            ))}
                          </ul>
                          {area.resource && (
                            <p style={{ fontSize: '14px', margin: '0', fontStyle: 'italic' }}>
                              Recommended Resource: {area.resource}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Key Competencies to Leverage */}
                  {parsedInsights.key_strengths && parsedInsights.key_strengths.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{
                        color: '#2F564D',
                        fontSize: '16px',
                        marginBottom: '12px',
                        fontWeight: '600'
                      }}>
                        Key Competencies to Leverage
                      </h3>
                      {parsedInsights.key_strengths.map((strength, index) => (
                        <div key={index} style={{ marginBottom: '16px' }}>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            margin: '0 0 4px 0'
                          }}>
                            Competency: {strength.competency}
                          </h4>
                          <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>
                            <strong>Existing Skill:</strong> {strength.example}
                          </p>
                          <p style={{ fontSize: '14px', margin: '0 0 8px 0', fontWeight: '500' }}>
                            How to leverage further:
                          </p>
                          <ul style={{ 
                            listStyleType: 'disc', 
                            paddingLeft: '20px', 
                            margin: '0',
                            fontSize: '14px'
                          }}>
                            {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => (
                              <li key={adviceIndex} style={{ marginBottom: '4px' }}>
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
          </div>
        )}

        {!insights && !isLoading && !error && (
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            AI insights will appear here once your assessment data is analyzed.
          </p>
        )}
      </div>

      {/* Recommended Next Steps */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Recommended Next Steps
        </h2>
        <ul style={{ 
          listStyleType: 'disc', 
          paddingLeft: '20px', 
          margin: '0',
          color: '#374151',
          fontSize: '14px'
        }}>
          <li style={{ marginBottom: '12px', lineHeight: '1.6' }}>
            Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development
          </li>
          <li style={{ marginBottom: '12px', lineHeight: '1.6' }}>
            Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress
          </li>
          <li style={{ marginBottom: '0', lineHeight: '1.6' }}>
            Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step
          </li>
        </ul>
      </div>

      {/* Professional Development Coaching */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Professional Development Coaching
        </h2>
        
        {/* Coach Photo */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img 
            src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png"
            alt="Professional Coach"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #2F564D'
            }}
          />
        </div>
        
        <p style={{ 
          margin: '0 0 12px 0', 
          lineHeight: '1.6',
          color: '#374151',
          fontSize: '14px'
        }}>
          Ready to take your leadership skills to the next level? Our expert coaches can help you:
        </p>
        <ul style={{ 
          listStyleType: 'disc', 
          paddingLeft: '20px', 
          margin: '0 0 16px 0',
          color: '#374151',
          fontSize: '14px'
        }}>
          <li style={{ marginBottom: '8px' }}>Create personalized development plans</li>
          <li style={{ marginBottom: '8px' }}>Practice new skills in a safe environment</li>
          <li style={{ marginBottom: '8px' }}>Overcome specific leadership challenges</li>
          <li style={{ marginBottom: '0' }}>Track your progress over time</li>
        </ul>
        
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
            Website: www.encouragercoaching.com
          </p>
          <p style={{ margin: '0', fontWeight: '600' }}>
            Book a free 30 minute discovery call: https://calendar.app.google/PwZrr2JJXVi1Uwrq7
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
          Leadership Assessment Tool • Generated on {currentDate}
        </p>
        <p style={{ margin: '0', lineHeight: '1.5' }}>
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </p>
      </div>
    </div>
  );
};

export default PDFTemplate;
