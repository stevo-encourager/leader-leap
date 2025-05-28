
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
      {/* Enhanced PDF-specific CSS */}
      <style>
        {`
          .pdf-template {
            font-family: system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 0;
          }
          
          .pdf-template h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2F564D;
            margin: 0 0 8px 0;
            padding: 0;
            text-align: center;
          }
          
          .pdf-template h2 {
            font-size: 18px;
            font-weight: 600;
            color: #2F564D;
            margin: 0 0 8px 0;
            padding: 0 0 12px 0;
            border-bottom: 2px solid #2F564D;
          }
          
          .pdf-template h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2F564D;
            margin: 8px 0 4px 0;
            padding: 0;
          }
          
          .pdf-template p {
            margin: 4px 0;
            padding: 0;
            line-height: 1.4;
          }
          
          .pdf-template ul {
            margin: 4px 0;
            padding-left: 18px;
            list-style-type: disc;
          }
          
          .pdf-template li {
            margin: 2px 0;
            padding: 0;
            line-height: 1.4;
            display: list-item;
          }
          
          .pdf-template li::marker {
            content: "• ";
            color: #2F564D;
            font-weight: bold;
          }
          
          .pdf-template .insight-content {
            margin: 4px 0;
            padding: 0;
            line-height: 1.4;
          }
          
          .pdf-template .priority-item {
            margin: 6px 0;
            padding: 0;
            border: none;
            background: none;
          }
          
          .pdf-template .priority-number {
            display: inline;
            font-weight: 600;
            color: #2F564D;
          }
          
          .pdf-template .priority-text {
            display: inline;
            margin-left: 6px;
          }
          
          .pdf-template .priority-gap {
            display: inline;
            font-weight: 600;
            color: #dc2626;
            margin-left: 6px;
          }
          
          .pdf-template .leverage-item {
            margin: 6px 0;
            padding: 0;
            border: none;
            background: none;
          }

          @page {
            margin: 15mm;
          }

          .page-break-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-break-inside: avoid !important;
          }
          
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
            -webkit-break-before: page !important;
            margin: 0 !important;
            padding: 0 !important;
            height: 0 !important;
            display: block !important;
          }
          
          .section-spacing {
            margin: 8px 0;
            padding: 0;
          }
          
          .no-spacing {
            margin: 0;
            padding: 0;
          }
        `}
      </style>

      {/* Main content container with PDF class */}
      <div className="pdf-template">
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
        <div className="no-spacing">
          <h1>Leadership Assessment Results</h1>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 8px 0', padding: '0' }}>
            Generated on {currentDate}
          </p>
        </div>

        {/* Profile Summary */}
        <div className="section-spacing page-break-avoid">
          <h2>Profile Summary</h2>
          {demographics?.role && (
            <p><strong>Role:</strong> {demographics.role}</p>
          )}
          {demographics?.yearsOfExperience && (
            <p><strong>Years of Experience:</strong> {demographics.yearsOfExperience}</p>
          )}
          {demographics?.industry && (
            <p><strong>Industry:</strong> {demographics.industry}</p>
          )}
          <p><strong>Overall Development Gap:</strong> {averageGap.toFixed(2)} points</p>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Assessment completed across {categories.length} competency areas
          </p>
        </div>

        {/* Competency Gap Chart */}
        <div className="section-spacing page-break-avoid">
          <h2>Competency Analysis - Radar Chart</h2>
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
            <div style={{ width: '100%', height: '100%' }}>
              <SkillGapChart categories={categories} isPDF={true} />
            </div>
          </div>
          
          {/* PAGE BREAK: Place as the ABSOLUTE LAST element of chart section with NO trailing content */}
          <div className="page-break-before"></div>
        </div>

        {/* AI Insights section */}
        <div className="no-spacing">
          <h2>AI-Powered Insights</h2>
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
                  <div className="section-spacing">
                    <h3>Assessment Summary</h3>
                    <FormattedSummary 
                      summary={parsedInsights.summary}
                      className="insight-content"
                    />
                  </div>
                )}

                {/* Priority Development Areas */}
                {parsedInsights.priority_areas && (
                  <div className="section-spacing">
                    <h3>Top 3 Priority Development Areas</h3>
                    {parsedInsights.priority_areas.map((area, index) => {
                      const resourceLink = generateResourceLink(area.resource);
                      
                      return (
                        <div key={index} className="priority-item">
                          <p>
                            <span className="priority-number">{index + 1}. {area.competency}</span>
                            <span className="priority-gap">(Gap: {area.gap.toFixed(1)})</span>
                          </p>
                          
                          <p><strong>Key insights:</strong></p>
                          <ul>
                            {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => (
                              <li key={insightIndex}>{insight}</li>
                            ))}
                          </ul>
                          
                          {area.resource && (
                            <p><strong>Recommended Resource:</strong> {resourceLink.title}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Key Competencies to Leverage */}
                {parsedInsights.key_strengths && (
                  <div className="section-spacing">
                    <h3>Key Competencies to Leverage</h3>
                    {parsedInsights.key_strengths.map((strength, index) => (
                      <div key={index} className="leverage-item">
                        <p><strong>Competency:</strong> {strength.competency}</p>
                        <p><strong>Existing Skill:</strong> {strength.example}</p>
                        <p><strong>How to leverage further:</strong></p>
                        <ul>
                          {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => (
                            <li key={adviceIndex}>{advice}</li>
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
        <div className="section-spacing page-break-avoid">
          <h2>Recommended Next Steps</h2>
          <ul>
            <li>Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development</li>
            <li>Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress</li>
            <li>Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step</li>
          </ul>
        </div>

        {/* Coaching Support */}
        <div className="section-spacing page-break-avoid">
          <h2>Coaching Support</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            width: '100%',
            margin: '0',
            padding: '0'
          }}>
            <div style={{ width: '100%' }}>
              <h3>Professional Development Coaching</h3>
              <p>Ready to take your leadership skills to the next level? Our expert coaches can help you:</p>
              <ul>
                <li>Create personalized development plans</li>
                <li>Practice new skills in a safe environment</li>
                <li>Overcome specific leadership challenges</li>
                <li>Track your progress over time</li>
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
        <div className="section-spacing" style={{
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b',
          paddingTop: '8px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
            Leadership Assessment Tool • Generated on {currentDate}
          </p>
          <p style={{ margin: '0', lineHeight: '1.4' }}>
            This assessment is designed to help you identify development opportunities and create targeted improvement plans.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFTemplate;
