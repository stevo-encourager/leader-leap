
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
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#1f2937',
      backgroundColor: 'white',
      padding: '20px',
      maxWidth: '210mm',
      minHeight: '297mm'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #2F564D'
      }}>
        <h1 style={{
          color: '#2F564D',
          fontSize: '24px',
          margin: '10px 0 5px 0',
          fontWeight: '600'
        }}>
          Leadership Assessment Results
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '14px',
          margin: '0'
        }}>
          Generated on {currentDate}
        </p>
      </div>

      {/* Profile Summary */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Profile Summary
        </h2>
        <div style={{ 
          backgroundColor: '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {demographics?.role && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Role:</strong> {demographics.role}
            </p>
          )}
          {demographics?.yearsOfExperience && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Years of Experience:</strong> {demographics.yearsOfExperience}
            </p>
          )}
          {demographics?.industry && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Industry:</strong> {demographics.industry}
            </p>
          )}
          <p style={{ margin: '0' }}>
            <strong>Overall Development Gap:</strong> {averageGap.toFixed(2)} points
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#64748b' }}>
            Assessment completed across {categories.length} competency areas
          </p>
        </div>
      </div>

      {/* Competency Gap Chart - Fixed formatting to match dashboard */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Competency Analysis - Radar Chart
        </h2>
        <div style={{ 
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          height: '500px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', height: '100%' }}>
            <SkillGapChart categories={categories} />
          </div>
        </div>
      </div>

      {/* AI-Generated Key Insights - Using the same component as dashboard with assessmentId */}
      <div style={{ marginBottom: '30px' }}>
        <AIInsights 
          categories={categories}
          demographics={demographics}
          averageGap={averageGap}
          assessmentId={assessmentId}
        />
      </div>

      {/* Recommended Next Steps */}
      <div style={{ marginBottom: '25px' }}>
        <RecommendedSteps />
      </div>

      {/* Coaching Support */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '20px'
        }}>
          <div>
            <CoachingSupport />
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '15px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <img 
              src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png" 
              alt="Coach Portrait" 
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                maxHeight: '200px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <p style={{ margin: '0' }}>
          Leadership Assessment Tool • Generated on {currentDate}
        </p>
        <p style={{ margin: '5px 0 0 0' }}>
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </p>
      </div>
    </div>
  );
};

export default PDFTemplate;
