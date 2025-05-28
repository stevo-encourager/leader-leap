
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import SkillGapChart from '../SkillGapChart';
import AIInsights from '../dashboard/AIInsights';

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

      {/* AI Insights - Plain Text */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          AI-Powered Insights
        </h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <AIInsights 
            categories={categories}
            demographics={demographics}
            averageGap={averageGap}
            assessmentId={assessmentId}
          />
        </div>
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

      {/* Coaching Support */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '20px',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Professional Development Coaching
        </h2>
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
          margin: '0',
          color: '#374151',
          fontSize: '14px'
        }}>
          <li style={{ marginBottom: '8px' }}>Create personalized development plans</li>
          <li style={{ marginBottom: '8px' }}>Practice new skills in a safe environment</li>
          <li style={{ marginBottom: '8px' }}>Overcome specific leadership challenges</li>
          <li style={{ marginBottom: '0' }}>Track your progress over time</li>
        </ul>
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
