import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import SkillGapChart from '../SkillGapChart';
import AIInsights from '../dashboard/AIInsights';
import RecommendedSteps from '../dashboard/RecommendedSteps';
import CoachingSupport from '../dashboard/CoachingSupport';

interface PDFTemplateProps {
  categories: Category[];
  demographics: Demographics;
  assessmentId?: string;
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

  console.log('PDFTemplate: Metrics calculated:', {
    averageGap
  });
  console.log('=== PDF TEMPLATE DEBUG END ===');

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
      color: '#1f2937',
      backgroundColor: 'white',
      margin: '0 auto',
      maxWidth: '190mm',
      width: '100%',
      minHeight: '297mm',
      padding: '15mm',
      boxSizing: 'border-box'
    }}>
      {/* PDF-specific CSS for plain text styling */}
      <style>
        {`
          .pdf-template {
            font-family: system-ui, -apple-system, sans-serif;
          }
          
          .pdf-template h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2F564D;
            margin: 0 0 8px 0;
            text-align: center;
          }
          
          .pdf-template h2 {
            font-size: 18px;
            font-weight: 600;
            color: #2F564D;
            margin: 16px 0 8px 0;
            border-bottom: 1px solid #2F564D;
            padding-bottom: 4px;
          }
          
          .pdf-template h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2F564D;
            margin: 12px 0 6px 0;
          }
          
          .pdf-template p {
            margin: 6px 0;
            line-height: 1.4;
          }
          
          .pdf-template ul {
            margin: 6px 0;
            padding-left: 20px;
          }
          
          .pdf-template li {
            margin: 4px 0;
            line-height: 1.4;
          }
          
          .pdf-template .insight-content {
            margin: 8px 0;
            line-height: 1.4;
          }
          
          .pdf-template .priority-item {
            margin: 8px 0;
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
            margin-left: 8px;
          }
          
          .pdf-template .priority-gap {
            display: inline;
            font-weight: 600;
            color: #dc2626;
            margin-left: 8px;
          }
          
          .pdf-template .leverage-item {
            margin: 4px 0;
            padding: 0;
            border: none;
            background: none;
          }
        `}
      </style>

      {/* Main content container with PDF class */}
      <div className="pdf-template">
        {/* Logo at the very top */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          pageBreakInside: 'avoid'
        }}>
          <img 
            src="/lovable-uploads/15f96168-94ad-4c49-8974-8923e4f45c4d.png" 
            alt="Encourager Logo" 
            style={{
              maxWidth: '300px',
              height: 'auto',
              maxHeight: '80px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Header */}
        <div className="page-break-avoid" style={{ marginBottom: '20px' }}>
          <h1>Leadership Assessment Results</h1>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0' }}>
            Generated on {currentDate}
          </p>
        </div>

        {/* Profile Summary */}
        <div className="profile-summary page-break-avoid" style={{ marginBottom: '20px' }}>
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
        <div className="page-break-avoid" style={{ marginBottom: '20px' }}>
          <h2>Competency Analysis - Radar Chart</h2>
          <div style={{ 
            height: '420px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            overflow: 'visible'
          }}>
            <div style={{ width: '100%', height: '100%' }}>
              <SkillGapChart categories={categories} isPDF={true} />
            </div>
          </div>
        </div>

        {/* Page break before AI Insights to ensure it starts on page 2 */}
        <div className="ai-insights-section page-break-before" style={{ marginBottom: '20px' }}>
          <AIInsights 
            categories={categories}
            demographics={demographics}
            averageGap={averageGap}
            assessmentId={assessmentId}
          />
        </div>

        {/* Recommended Next Steps */}
        <div className="page-break-avoid" style={{ marginBottom: '20px' }}>
          <h2>Recommended Next Steps</h2>
          <ul>
            <li>Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development</li>
            <li>Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress</li>
            <li>Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step</li>
          </ul>
        </div>

        {/* Coaching Support */}
        <div className="page-break-avoid" style={{ marginBottom: '20px' }}>
          <h2>Coaching Support</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '20px',
            width: '100%'
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
        <div className="page-break-avoid" style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>
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
