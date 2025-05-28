
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
      <div className="page-break-avoid" style={{
        textAlign: 'center',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #2F564D'
      }}>
        <h1 style={{
          color: '#2F564D',
          fontSize: '26px',
          margin: '0 0 8px 0',
          fontWeight: '700',
          letterSpacing: '-0.5px'
        }}>
          Leadership Assessment Results
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: '0',
          fontWeight: '500'
        }}>
          Generated on {currentDate}
        </p>
      </div>

      {/* Profile Summary */}
      <div className="profile-summary page-break-avoid" style={{ 
        marginBottom: '25px'
      }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          Profile Summary
        </h2>
        <div style={{ 
          backgroundColor: '#f8fafc',
          padding: '18px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {demographics?.role && (
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>Role:</strong> {demographics.role}
            </p>
          )}
          {demographics?.yearsOfExperience && (
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>Years of Experience:</strong> {demographics.yearsOfExperience}
            </p>
          )}
          {demographics?.industry && (
            <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
              <strong>Industry:</strong> {demographics.industry}
            </p>
          )}
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            <strong>Overall Development Gap:</strong> {averageGap.toFixed(2)} points
          </p>
          <p style={{ margin: '0', fontSize: '12px', color: '#64748b' }}>
            Assessment completed across {categories.length} competency areas
          </p>
        </div>
      </div>

      {/* Competency Gap Chart with enhanced PDF styling */}
      <div className="page-break-avoid" style={{ 
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          Competency Analysis - Radar Chart
        </h2>
        <div style={{ 
          backgroundColor: '#ffffff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          height: '450px', // Reduced height from 500px to 450px
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

      {/* Page break before AI Insights to ensure it starts properly */}
      <div className="ai-insights-section page-break-before" style={{ 
        marginBottom: '25px',
        width: '100%'
      }}>
        <AIInsights 
          categories={categories}
          demographics={demographics}
          averageGap={averageGap}
          assessmentId={assessmentId}
        />
      </div>

      {/* Recommended Next Steps */}
      <div className="page-break-avoid" style={{ 
        marginBottom: '25px',
        width: '100%'
      }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          Recommended Next Steps
        </h2>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '18px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <ul style={{ 
            listStyleType: 'disc', 
            paddingLeft: '20px', 
            margin: '0',
            color: '#374151'
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
      </div>

      {/* Coaching Support */}
      <div className="page-break-avoid" style={{ 
        marginBottom: '25px',
        width: '100%'
      }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          Coaching Support
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px',
          width: '100%'
        }}>
          <div style={{ width: '100%' }}>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h3 style={{
                color: '#2F564D',
                fontSize: '18px',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Professional Development Coaching
              </h3>
              <p style={{ 
                margin: '0 0 12px 0', 
                lineHeight: '1.6',
                color: '#374151'
              }}>
                Ready to take your leadership skills to the next level? Our expert coaches can help you:
              </p>
              <ul style={{ 
                listStyleType: 'disc', 
                paddingLeft: '20px', 
                margin: '0',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '8px' }}>Create personalized development plans</li>
                <li style={{ marginBottom: '8px' }}>Practice new skills in a safe environment</li>
                <li style={{ marginBottom: '8px' }}>Overcome specific leadership challenges</li>
                <li style={{ marginBottom: '0' }}>Track your progress over time</li>
              </ul>
            </div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            textAlign: 'center',
            width: '100%',
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
                maxHeight: '180px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="page-break-avoid" style={{
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
