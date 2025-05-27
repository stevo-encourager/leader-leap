
import React from 'react';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import { getTopStrengths, getLowestSkills } from '@/utils/assessmentCalculations/skillMetrics';

interface PDFTemplateProps {
  categories: Category[];
  demographics: Demographics;
}

const PDFTemplate: React.FC<PDFTemplateProps> = ({ categories, demographics }) => {
  const timestamp = new Date().toISOString();
  console.log('=== PDF TEMPLATE DEBUG START ===');
  console.log(`PDFTemplate: Component rendering at ${timestamp}`);
  console.log('PDFTemplate: categories type:', typeof categories);
  console.log('PDFTemplate: categories is array:', Array.isArray(categories));
  console.log('PDFTemplate: categories length:', categories?.length || 0);
  console.log('PDFTemplate: demographics type:', typeof demographics);
  console.log('PDFTemplate: demographics keys:', demographics ? Object.keys(demographics) : 'none');
  
  // Enhanced validation with detailed logging
  if (!categories) {
    console.error('PDFTemplate: Categories prop is null/undefined');
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>PDF Template Error</h1>
        <p>Categories data is null or undefined</p>
        <p>Debug: categories = {String(categories)}</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    );
  }
  
  if (!Array.isArray(categories)) {
    console.error('PDFTemplate: Categories prop is not an array, type:', typeof categories);
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>PDF Template Error</h1>
        <p>Categories data is not an array</p>
        <p>Debug: typeof categories = {typeof categories}</p>
        <p>Debug: categories = {String(categories)}</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    );
  }
  
  if (categories.length === 0) {
    console.error('PDFTemplate: Categories array is empty');
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>PDF Template Error</h1>
        <p>Categories array is empty</p>
        <p>No assessment data was provided to generate this PDF.</p>
        <p>Timestamp: {timestamp}</p>
      </div>
    );
  }
  
  // Detailed analysis of the received data
  console.log('PDFTemplate: Analyzing received data...');
  let totalSkills = 0;
  let skillsWithRatings = 0;
  let sampleSkills = [];
  
  categories.forEach((category, catIndex) => {
    console.log(`PDFTemplate: Category ${catIndex}:`, {
      id: category?.id,
      title: category?.title,
      skillsCount: category?.skills?.length || 0
    });
    
    if (category && category.skills && Array.isArray(category.skills)) {
      totalSkills += category.skills.length;
      
      category.skills.forEach((skill, skillIndex) => {
        if (skill && skill.ratings) {
          const currentRating = skill.ratings.current;
          const desiredRating = skill.ratings.desired;
          
          if (skillIndex < 2 && catIndex < 2) { // Log first few skills for debugging
            console.log(`PDFTemplate: Sample skill - ${category.title}/${skill.name}:`, {
              currentRating,
              desiredRating,
              currentType: typeof currentRating,
              desiredType: typeof desiredRating
            });
            
            sampleSkills.push({
              category: category.title,
              skill: skill.name,
              current: currentRating,
              desired: desiredRating
            });
          }
          
          if ((typeof currentRating === 'number' && currentRating > 0) || 
              (typeof desiredRating === 'number' && desiredRating > 0)) {
            skillsWithRatings++;
          }
        }
      });
    }
  });
  
  console.log('PDFTemplate: Data analysis results:');
  console.log('- Total categories:', categories.length);
  console.log('- Total skills:', totalSkills);
  console.log('- Skills with ratings:', skillsWithRatings);
  console.log('- Sample skills:', sampleSkills);
  
  // Try to calculate metrics with error handling
  let averageGap = 0;
  let strengths = [];
  let lowestSkills = [];
  
  try {
    console.log('PDFTemplate: Calculating metrics...');
    averageGap = calculateAverageGap(categories);
    strengths = getTopStrengths(categories, 5);
    lowestSkills = getLowestSkills(categories, 5);
    
    console.log('PDFTemplate: Metrics calculated successfully:');
    console.log('- Average gap:', averageGap);
    console.log('- Strengths count:', strengths.length);
    console.log('- Lowest skills count:', lowestSkills.length);
  } catch (error) {
    console.error('PDFTemplate: Error calculating metrics:', error);
  }

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate category averages for display
  const categoryAverages = categories.map(category => {
    const skillGaps = category.skills
      .filter(skill => skill.ratings?.current !== undefined && skill.ratings?.desired !== undefined)
      .map(skill => (skill.ratings.desired || 0) - (skill.ratings.current || 0));
    
    const avgGap = skillGaps.length > 0 
      ? skillGaps.reduce((sum, gap) => sum + gap, 0) / skillGaps.length 
      : 0;

    return {
      title: category.title,
      averageGap: avgGap,
      skillCount: skillGaps.length
    };
  }).sort((a, b) => b.averageGap - a.averageGap);

  console.log('PDFTemplate: Category averages calculated:', categoryAverages.length);
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
      {/* Visible timestamp marker to confirm new code is running */}
      <div style={{
        backgroundColor: '#e0f2fe',
        border: '1px solid #0277bd',
        padding: '8px',
        marginBottom: '15px',
        fontSize: '10px',
        textAlign: 'center'
      }}>
        <strong>PDF Generated:</strong> {timestamp}
        <br />
        <strong>Template Version:</strong> Updated with HTML cleaning
        <br />
        <strong>Data Status:</strong> {skillsWithRatings} skills with ratings from {categories.length} categories
      </div>

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
          {demographics?.jobTitle && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Job Title:</strong> {demographics.jobTitle}
            </p>
          )}
          {demographics?.department && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Department:</strong> {demographics.department}
            </p>
          )}
          {demographics?.experienceLevel && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Experience Level:</strong> {demographics.experienceLevel}
            </p>
          )}
          {demographics?.teamSize && (
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Team Size:</strong> {demographics.teamSize}
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

      {/* Show data even if calculations fail */}
      {skillsWithRatings === 0 && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '15px',
          marginBottom: '25px',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#991b1b', margin: '0 0 10px 0' }}>No Rating Data Found</h3>
          <p style={{ margin: '0', fontSize: '11px' }}>
            This PDF was generated but no completed assessment ratings were found in the data.
            Please complete the assessment with actual ratings to see meaningful results.
          </p>
        </div>
      )}

      {/* Top Development Areas */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Competency Areas Ranked by Development Gap
        </h2>
        <div style={{ 
          backgroundColor: '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {categoryAverages.slice(0, 5).map((category, index) => (
            <div key={category.title} style={{
              marginBottom: index < 4 ? '12px' : '0',
              paddingBottom: index < 4 ? '12px' : '0',
              borderBottom: index < 4 ? '1px solid #e2e8f0' : 'none'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{ fontWeight: '600' }}>
                  {index + 1}. {category.title}
                </span>
                <span style={{
                  backgroundColor: category.averageGap > 2 ? '#fecaca' : category.averageGap > 1 ? '#fed7aa' : '#bbf7d0',
                  color: category.averageGap > 2 ? '#991b1b' : category.averageGap > 1 ? '#9a3412' : '#166534',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {category.averageGap.toFixed(2)} gap
                </span>
              </div>
              <p style={{
                margin: '0',
                fontSize: '11px',
                color: '#64748b'
              }}>
                {category.skillCount} skills assessed
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Strengths */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Your Top Strengths
        </h2>
        <div style={{ 
          backgroundColor: '#f0fdf4',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          {strengths.length > 0 ? (
            strengths.map((strength, index) => (
              <div key={`${strength.categoryTitle}-${strength.name}`} style={{
                marginBottom: index < strengths.length - 1 ? '10px' : '0',
                paddingBottom: index < strengths.length - 1 ? '10px' : '0',
                borderBottom: index < strengths.length - 1 ? '1px solid #dcfce7' : 'none'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                  {strength.name}
                </div>
                <div style={{ fontSize: '11px', color: '#166534' }}>
                  {strength.categoryTitle} • Current: {strength.ratings?.current}/7 • Desired: {strength.ratings?.desired}/7
                </div>
              </div>
            ))
          ) : (
            <p style={{ margin: '0', fontStyle: 'italic', color: '#64748b' }}>
              Complete your assessment to see your strengths
            </p>
          )}
        </div>
      </div>

      {/* Areas for Development */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Priority Development Areas
        </h2>
        <div style={{ 
          backgroundColor: '#fef2f2',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          {lowestSkills.length > 0 ? (
            lowestSkills.map((skill, index) => (
              <div key={`${skill.categoryTitle}-${skill.name}`} style={{
                marginBottom: index < lowestSkills.length - 1 ? '10px' : '0',
                paddingBottom: index < lowestSkills.length - 1 ? '10px' : '0',
                borderBottom: index < lowestSkills.length - 1 ? '1px solid #fee2e2' : 'none'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                  {skill.name}
                </div>
                <div style={{ fontSize: '11px', color: '#991b1b' }}>
                  {skill.categoryTitle} • Current: {skill.ratings?.current}/7 • Desired: {skill.ratings?.desired}/7 • Gap: {skill.gap.toFixed(1)}
                </div>
              </div>
            ))
          ) : (
            <p style={{ margin: '0', fontStyle: 'italic', color: '#64748b' }}>
              Complete your assessment to see development opportunities
            </p>
          )}
        </div>
      </div>

      {/* Detailed Category Breakdown */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Detailed Assessment Results
        </h2>
        {categories.map((category, categoryIndex) => (
          <div key={category.id} style={{
            marginBottom: '20px',
            backgroundColor: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              color: '#2F564D',
              fontSize: '16px',
              marginBottom: '10px',
              fontWeight: '600'
            }}>
              {category.title}
            </h3>
            <div style={{ marginLeft: '10px' }}>
              {category.skills && category.skills.map((skill, skillIndex) => {
                const currentRating = skill.ratings?.current || 0;
                const desiredRating = skill.ratings?.desired || 0;
                const gap = desiredRating - currentRating;
                
                return (
                  <div key={skill.id} style={{
                    marginBottom: skillIndex < category.skills.length - 1 ? '8px' : '0',
                    paddingBottom: skillIndex < category.skills.length - 1 ? '8px' : '0',
                    borderBottom: skillIndex < category.skills.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: '500' }}>{skill.name}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Current: {currentRating}/7 | Desired: {desiredRating}/7 | Gap: {gap.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Next Steps */}
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{
          color: '#2F564D',
          fontSize: '18px',
          marginBottom: '15px',
          fontWeight: '600',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          Recommended Next Steps
        </h2>
        <div style={{ 
          backgroundColor: '#f0f9ff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <ol style={{ margin: '0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Focus on your highest-gap competencies</strong> - Start with areas showing the largest development gaps
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Create a 90-day development plan</strong> - Choose 2-3 specific skills to improve
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Seek feedback and coaching</strong> - Work with your manager or mentor on priority areas
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Practice new behaviors</strong> - Apply new skills in real work situations
            </li>
            <li style={{ marginBottom: '0' }}>
              <strong>Retake the assessment</strong> - Track your progress in 3-6 months
            </li>
          </ol>
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
