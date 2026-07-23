
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import { logger } from '@/utils/productionLogger';

// Define styles for React PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    maxWidth: 200,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  leftAlignedSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'left',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
    marginTop: 12,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  boldText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listItem: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 3,
    marginLeft: 15,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    backgroundColor: '#ffffff',
    width: '100%',
  },
  chartImage: {
    maxWidth: 475,
    maxHeight: 475, // Square for perfect symmetry
    marginBottom: 8,
    alignSelf: 'center',
  },
  chartPlaceholder: {
    width: 400,
    height: 300,
    backgroundColor: '#f3f4f6',
    border: '2px dashed #d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    alignSelf: 'center',
  },
  priorityItem: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  strengthItem: {
    marginBottom: 10,
  },
  coachingContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  coachingText: {
    flex: 2,
  },
  coachingImage: {
    flex: 1,
    maxWidth: 150,
    maxHeight: 200,
    alignSelf: 'flex-start',
    borderRadius: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#0066CC',
    textDecoration: 'none',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748b',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  profileSummary: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  profileRow: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#374151',
  },
  profileLabel: {
    fontWeight: 'bold',
    color: '#000000',
  },
  summarySection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  prioritySection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
});

interface PriorityArea {
  competency: string;
  gap: number;
  insights: string[];
  resource?: string; // Legacy field for backward compatibility
  resources?: string[]; // New field for multiple resources
}

interface KeyStrength {
  competency: string;
  example: string;
  leverage_advice: string[];
  resources?: string[]; // New field for multiple resources
}

interface AIInsightsData {
  summary: string;
  priority_areas: PriorityArea[];
  key_strengths: KeyStrength[];
}

interface ReactPDFDocumentProps {
  categories: Category[];
  demographics: Demographics;
  insights: string;
  chartImageDataUrl?: string;
  userName?: string;
  assessmentDate?: string;
}

// Add a helper to render markdown links in summary
function renderSummaryWithLinks(summary: string) {
  // Regex to match [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = linkRegex.exec(summary)) !== null) {
    if (match.index > lastIndex) {
      parts.push(summary.substring(lastIndex, match.index));
    }
    parts.push(
      <Link key={key++} src={match[2]} style={styles.linkText}>
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < summary.length) {
    parts.push(summary.substring(lastIndex));
  }
  return parts;
}

// Helper to calculate averages and gap for a category
function getCategoryStats(category) {
  const validSkills = (category.skills || []).filter(skill => skill && skill.ratings && typeof skill.ratings.current === 'number' && typeof skill.ratings.desired === 'number');
  const currentAvg = validSkills.length > 0 ? Math.round(validSkills.reduce((sum, skill) => sum + skill.ratings.current, 0) / validSkills.length * 10) / 10 : 0;
  const desiredAvg = validSkills.length > 0 ? Math.round(validSkills.reduce((sum, skill) => sum + skill.ratings.desired, 0) / validSkills.length * 10) / 10 : 0;
  const gap = Math.round((desiredAvg - currentAvg) * 10) / 10;
  return { currentAvg, desiredAvg, gap, validSkills };
}

const ReactPDFDocument: React.FC<ReactPDFDocumentProps> = ({
  categories,
  demographics,
  insights,
  chartImageDataUrl,
  userName,
  assessmentDate
}) => {
  const averageGap = calculateAverageGap(categories);
  const currentDate = assessmentDate 
    ? new Date(assessmentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  // Table font sizes and padding for compact layout
  const tableFontSize = 9;
  const tableHeaderFontSize = 10;
  const tablePadding = 2;
  const competencyFontSize = 13; // Larger for competency names and scores

  // Enhanced chart image logging with detailed debugging for 11:11 version restoration

  // Chart image validation: only accept data:image/ URLs
  if (!chartImageDataUrl) {
    logger.error('ReactPDFDocument: No chart image data URL provided - chart capture may have failed');
  } else if (!chartImageDataUrl.startsWith('data:image/')) {
    logger.error('ReactPDFDocument: Invalid chart image data URL format:', chartImageDataUrl?.substring(0, 50));
  } else {
  
  }

  // Enhanced parseInsights function with better error handling and null checks
  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      // Add null/undefined check for insightsText
      if (!insightsText || typeof insightsText !== 'string') {
        return null;
      }

      const parsed = JSON.parse(insightsText);
      
      // Enhanced validation with null checks
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        return null;
      }

      // Validate and clean priority areas with enhanced resource handling
      const cleanedPriorityAreas = parsed.priority_areas
        .filter(area => area && typeof area === 'object')
        .map(area => ({
          competency: area.competency || 'Unknown Competency',
          gap: typeof area.gap === 'number' ? area.gap : 0,
          insights: Array.isArray(area.insights) ? area.insights.filter(insight => insight && typeof insight === 'string') : [],
          resource: area.resource || '', // Legacy field
          resources: area.resources || (area.resource ? [area.resource] : []) // Handle both old and new formats
        }));

      // Validate and clean key strengths with enhanced resource handling
      const cleanedKeyStrengths = parsed.key_strengths
        .filter(strength => strength && typeof strength === 'object')
        .map(strength => ({
          competency: strength.competency || 'Unknown Competency',
          example: strength.example || '',
          leverage_advice: Array.isArray(strength.leverage_advice) ? strength.leverage_advice.filter(advice => advice && typeof advice === 'string') : [],
          resources: strength.resources || []
        }));

      return {
        summary: parsed.summary || '',
        priority_areas: cleanedPriorityAreas,
        key_strengths: cleanedKeyStrengths
      };
    } catch (error) {
      return null;
    }
  };

  // Enhanced function to parse resources from markdown format and generate working links
  const parseAndFormatResources = (resources: string[]): Array<{name: string, url: string | null}> => {
    if (!resources || !Array.isArray(resources)) {
      return [];
    }

    const formattedResources: Array<{name: string, url: string | null}> = [];
    
    resources.forEach(resource => {
      if (!resource || typeof resource !== 'string') {
        return;
      }

      // Check if it's in markdown format [Name](url)
      const markdownMatch = resource.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (markdownMatch) {
        const name = markdownMatch[1];
        const url = markdownMatch[2];
        
        // Only add if URL is valid (starts with http/https)
        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
          formattedResources.push({ name, url });
        } else {
          // Add with name but no valid URL
          formattedResources.push({ name, url: null });
        }
      } else {
        // Try to get a working link from resource mapping
        // const resourceLink = generateResourceLink(resource); // This line is removed
        // if (resourceLink.hasValidLink && resourceLink.url) { // This line is removed
        //   formattedResources.push({  // This line is removed
        //     name: resourceLink.title,  // This line is removed
        //     url: resourceLink.url  // This line is removed
        //   }); // This line is removed
        // } else { // This line is removed
          // Add the resource title even if no valid link is found // This line is removed
          formattedResources.push({ 
            name: resource, 
            url: null 
          });
        // } // This line is removed
      }
    });
    
    return formattedResources;
  };

  const parsedInsights = insights ? parseInsights(insights) : null;

  return (
    <Document>
      {/* Page 1 - Cover, Profile, and Chart */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="/LeaderLeapLogo.png"
          />
          <Text style={styles.title}>Leader Leap Assessment Results</Text>
          <Text style={styles.subtitle}>Assessment taken on {currentDate}</Text>
        </View>
        <Text style={styles.sectionTitle}>Profile Summary</Text>
        {userName && (
          <Text style={styles.text}><Text style={styles.boldText}>Name:</Text> {userName}</Text>
        )}
        {demographics?.role && (
          <Text style={styles.text}><Text style={styles.boldText}>Role:</Text> {demographics.role}</Text>
        )}
        {demographics?.yearsOfExperience && (
          <Text style={styles.text}><Text style={styles.boldText}>Years of Experience:</Text> {demographics.yearsOfExperience}</Text>
        )}
        {demographics?.industry && (
          <Text style={styles.text}><Text style={styles.boldText}>Industry:</Text> {demographics.industry}</Text>
        )}
        <Text style={styles.text}><Text style={styles.boldText}>Average Development Gap:</Text> {averageGap.toFixed(2)} points</Text>
        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Competency Analysis - Radar Chart</Text>
        <View style={styles.chartContainer}>
          {chartImageDataUrl && chartImageDataUrl.startsWith('data:image/') ? (
            <Image 
              style={styles.chartImage}
              src={chartImageDataUrl}
            />
          ) : (
            <View style={styles.chartPlaceholder}>
              <Text style={styles.text}>Radar chart visualization shows your current vs desired competency levels</Text>
              <Text style={[styles.text, { fontSize: 10, color: '#64748b', marginTop: 10 }]}>Chart image could not be captured - this may indicate a technical issue with chart rendering</Text>
            </View>
          )}
        </View>
        

      </Page>

      {/* Page 2 - Key Insights & Recommendations */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Your Personal Insights</Text>
        <Text style={styles.leftAlignedSubtitle}>Personalised leadership development insights and recommendations</Text>

        {parsedInsights ? (
          <View>
            {/* Assessment Summary */}
            {parsedInsights.summary && (
              <View style={styles.summarySection}>
                <Text style={styles.subsectionTitle}>Executive Summary</Text>
                {(() => {
                  const summary = parsedInsights.summary;
                  // Split into paragraphs (by double newline or single newline)
                  const paragraphs = summary.split(/\n+/);
                  const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>|\[([^\]]+)\]\(([^)]+)\)/g;
                  let key = 0;
                  return paragraphs.map((paragraph, idx) => {
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = linkRegex.exec(paragraph)) !== null) {
                      // Add text before the link
                      if (match.index > lastIndex) {
                        parts.push(paragraph.substring(lastIndex, match.index));
                      }
                      // HTML anchor tag
                      if (match[1] && match[2]) {
                        parts.push(
                          <Link key={key++} src={match[1]} style={styles.linkText}>{match[2]}</Link>
                        );
                      }
                      // Markdown link
                      else if (match[3] && match[4]) {
                        parts.push(
                          <Link key={key++} src={match[4]} style={styles.linkText}>{match[3]}</Link>
                        );
                      }
                      lastIndex = match.index + match[0].length;
                    }
                    // Add any remaining text after the last link
                    if (lastIndex < paragraph.length) {
                      parts.push(paragraph.substring(lastIndex));
                    }
                    // If no links, just render the paragraph as plain text
                    if (parts.length === 0) {
                      return <Text key={key++} style={styles.text}>{paragraph}</Text>;
                    }
                    return <Text key={key++} style={styles.text}>{parts}</Text>;
                  });
                })()}
              </View>
            )}

            {/* Priority Development Areas with clickable resource links */}
            {parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Top 3 Priority Development Areas</Text>
                {parsedInsights.priority_areas.map((area, index) => {
                  // Enhanced null checking for area
                  if (!area || typeof area !== 'object') {
            
                    return null;
                  }

                  // Get all available resources (both legacy and new format)
                  const allResources = [];
                  if (area.resource && typeof area.resource === 'string' && area.resource.trim()) {
                    allResources.push(area.resource);
                  }
                  if (area.resources && Array.isArray(area.resources)) {
                    allResources.push(...area.resources.filter(r => r && typeof r === 'string' && r.trim()));
                  }

                  // Parse and format resources
                  const formattedResources = parseAndFormatResources(allResources);

                  return (
                    <View key={index} style={styles.prioritySection}>
                      <Text style={styles.boldText}>
                        {index + 1}. {area.competency || 'Unknown Competency'} (Gap: {(area.gap || 0).toFixed(1)})
                      </Text>
                      <Text style={styles.text}>Key Insights & Recommendations:</Text>
                      {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => {
                        // Additional safety check for insight
                        if (!insight || typeof insight !== 'string') {
                          return null;
                        }
                        return (
                          <Text key={insightIndex} style={styles.listItem}>• {insight}</Text>
                        );
                      })}
                      
                      {/* Updated Resource Display - clickable resource names */}
                      <Text style={styles.boldText}>Recommended Resources:</Text>
                      {formattedResources.length > 0 ? (
                        formattedResources.map((resource, resourceIndex) => (
                          resource.url ? (
                            <Link key={resourceIndex} src={resource.url} style={styles.linkText}>
                              {resource.name}
                            </Link>
                          ) : (
                            <Text key={resourceIndex} style={styles.text}>
                              {resource.name}
                            </Text>
                          )
                        ))
                      ) : (
                        <Text style={styles.text}>No specific resource mapping available</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.text}>AI insights are being generated...</Text>
        )}
      </Page>

      {/* Page 3 - Key Competencies to Leverage */}
      <Page size="A4" style={styles.page}>
        {parsedInsights?.key_strengths && parsedInsights.key_strengths.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Key Competencies to Leverage</Text>
            {parsedInsights.key_strengths.map((strength, index) => {
              // Enhanced null checking for strength
              if (!strength || typeof strength !== 'object') {
        
                return null;
              }

              // Parse and format resources for strengths
              const formattedResources = parseAndFormatResources(strength.resources || []);

              return (
                <View key={index} style={styles.prioritySection}>
                  <Text style={styles.boldText}>{`${index + 1}. ${strength.competency || 'Unknown Competency'}`}</Text>
                  <Text style={styles.text}>Existing Skill: {strength.example || 'No example provided'}</Text>
                  <Text style={styles.boldText}>How to leverage further:</Text>
                  {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => {
                    // Additional safety check for advice
                    if (!advice || typeof advice !== 'string') {
                      return null;
                    }
                    return (
                      <Text key={adviceIndex} style={styles.listItem}>• {advice}</Text>
                    );
                  })}
                  
                  {/* Updated Resource Display for Strengths - clickable resource names */}
                  {formattedResources.length > 0 && (
                    <View>
                      <Text style={styles.boldText}>Recommended Resources:</Text>
                      {formattedResources.map((resource, resourceIndex) => (
                        resource.url ? (
                          <Link key={resourceIndex} src={resource.url} style={styles.linkText}>
                            {resource.name}
                          </Link>
                        ) : (
                          <Text key={resourceIndex} style={styles.text}>
                            {resource.name}
                          </Text>
                        )
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </Page>

      {/* Page 4 - Skills Assessment */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, { marginTop: 10, fontSize: 14 }]}>Skills Assessment</Text>
        <Text style={[styles.text, { fontSize: tableFontSize, marginBottom: 4 }]}>Your self-assessment scores across all competencies and the individual skills within them.</Text>
        {/* Table header */}
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#b0b0b0', backgroundColor: '#f3f4f6', marginTop: 4 }}>
          <Text style={{ fontWeight: 'bold', fontSize: tableHeaderFontSize, flex: 2, padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0', textAlign: 'left' }}>Competency</Text>
          <Text style={{ fontWeight: 'bold', fontSize: tableHeaderFontSize, flex: 1, textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>Current</Text>
          <Text style={{ fontWeight: 'bold', fontSize: tableHeaderFontSize, flex: 1, textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>Desired</Text>
          <Text style={{ fontWeight: 'bold', fontSize: tableHeaderFontSize, flex: 1, textAlign: 'center', padding: tablePadding, borderRightWidth: 0, borderColor: '#b0b0b0' }}>Gap</Text>
        </View>
        {/* Table rows */}
        {categories
          .map(cat => ({ ...cat, ...getCategoryStats(cat) }))
          .sort((a, b) => b.gap - a.gap)
          .map(category => (
            <View key={category.id} style={{ borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#b0b0b0' }}>
              {/* Competency row */}
              <View style={{ flexDirection: 'row', backgroundColor: '#fff' }}>
                <Text style={{ flex: 2, fontWeight: 'bold', fontSize: 11, color: '#000000', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0', textAlign: 'left' }}>{category.title}</Text>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 11, color: '#000000', textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>{category.currentAvg}</Text>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 11, color: '#000000', textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>{category.desiredAvg}</Text>
                <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 11, color: '#000000', textAlign: 'center', padding: tablePadding, borderRightWidth: 0 }}>{category.gap}</Text>
              </View>
              {/* Skill rows */}
              {category.validSkills.map(skill => {
                const skillGap = (typeof skill.ratings.desired === 'number' && typeof skill.ratings.current === 'number') ? (Math.round((skill.ratings.desired - skill.ratings.current) * 10) / 10) : '';
                return (
                  <View key={skill.id} style={{ flexDirection: 'row', backgroundColor: '#fafafa', borderTopWidth: 1, borderColor: '#e5e7eb' }}>
                    <Text style={{ flex: 2, fontSize: tableFontSize, padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0', textAlign: 'left' }}>• {skill.name}</Text>
                    <Text style={{ flex: 1, fontSize: tableFontSize, textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>{skill.ratings.current}</Text>
                    <Text style={{ flex: 1, fontSize: tableFontSize, textAlign: 'center', padding: tablePadding, borderRightWidth: 1, borderColor: '#b0b0b0' }}>{skill.ratings.desired}</Text>
                    <Text style={{ flex: 1, fontSize: tableFontSize, textAlign: 'center', padding: tablePadding, borderRightWidth: 0 }}>{skillGap}</Text>
                  </View>
                );
              })}
            </View>
          ))}
      </Page>

      {/* Page 5 - Recommended Next Steps & Self-Leadership Coaching */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Create a 6-month action plan</Text>
        <Text style={styles.listItem}>• Navigate to <Link src="https://www.leader-leap.com/profile" style={styles.linkText}>My Profile</Link> and create plan to address your most critical competency gaps</Text>
        <Text style={styles.listItem}>• Collaborate with your manager, mentor or coach to develop your leadership development strategy</Text>
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Get some expert coaching support</Text>
        <Text style={styles.listItem}>• Learn how to lean into your strengths to achieve your goals</Text>
        <Text style={styles.listItem}>• Understand yourself better and eliminate self-limiting beliefs or obstacles</Text>
        <Text style={styles.listItem}>• Establish regular touchpoints for tracking growth and gaining insights</Text>
        <Link src="https://www.encourager.co.uk/about" style={[styles.boldText, { marginTop: 10, color: '#0066CC', textDecoration: 'none' }]}>Learn more about me</Link>
        <Link src="https://www.encourager.co.uk/services/executive-coaching" style={[styles.boldText, { marginTop: 5, color: '#0066CC', textDecoration: 'none' }]}>Understand the process</Link>
        <Link src="https://calendar.app.google/PwZrr2JJXVi1Uwrq7" style={[styles.boldText, { marginTop: 5, color: '#0066CC', textDecoration: 'none' }]}>Book a free 30 minute discovery call</Link>
        <Text style={[styles.text, { marginTop: 25, fontWeight: 'bold' }]}>Steve Thompson</Text>
        <Text style={[styles.text, { fontSize: 10 }]}>Executive Coach</Text>
        <Text style={[styles.text, { fontSize: 10 }]}>steve.thompson@leader-leap.com</Text>
        <Text style={[styles.footer, { marginTop: 20 }]}>
          Leader Leap: Discover Your Leadership Gaps • Assessment taken on {currentDate}{'\n'}
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </Text>
      </Page>
    </Document>
  );
};

export default ReactPDFDocument;
