
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import { generateResourceLink } from '@/utils/resourceMapping';

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F564D',
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
    color: '#2F564D',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2F564D',
    paddingBottom: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F564D',
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
    maxWidth: 500,
    maxHeight: 500,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    color: '#374151',
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
    color: '#2F564D',
    textDecoration: 'underline',
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
  bottomLogo: {
    maxWidth: 200,
    marginTop: 8,
    alignSelf: 'flex-start',
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
}

const ReactPDFDocument: React.FC<ReactPDFDocumentProps> = ({
  categories,
  demographics,
  insights,
  chartImageDataUrl
}) => {
  const averageGap = calculateAverageGap(categories);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Enhanced chart image logging with detailed debugging for 11:11 version restoration
  console.log('ReactPDFDocument: Chart image data received (11:11 version debug):', {
    hasChartData: !!chartImageDataUrl,
    dataUrlLength: chartImageDataUrl?.length || 0,
    dataUrlPreview: chartImageDataUrl?.substring(0, 100) || 'No data',
    isValidDataUrl: chartImageDataUrl?.startsWith('data:image/') || false,
    timestamp: new Date().toISOString()
  });

  // Log additional context about chart data availability
  if (!chartImageDataUrl) {
    console.error('ReactPDFDocument: No chart image data URL provided - chart capture may have failed');
  } else if (!chartImageDataUrl.startsWith('data:image/')) {
    console.error('ReactPDFDocument: Invalid chart image data URL format:', chartImageDataUrl?.substring(0, 50));
  } else {
    console.log('ReactPDFDocument: Valid chart image data received, ready for PDF inclusion');
  }

  // Enhanced parseInsights function with better error handling and null checks
  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      // Add null/undefined check for insightsText
      if (!insightsText || typeof insightsText !== 'string') {
        console.log('ReactPDFDocument: Invalid insights text provided');
        return null;
      }

      const parsed = JSON.parse(insightsText);
      
      // Enhanced validation with null checks
      if (!parsed || typeof parsed !== 'object') {
        console.log('ReactPDFDocument: Parsed insights is not a valid object');
        return null;
      }

      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        console.log('ReactPDFDocument: Missing required properties in parsed insights');
        return null;
      }
      
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        console.log('ReactPDFDocument: Priority areas or key strengths are not arrays');
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
      console.error('ReactPDFDocument: Error parsing insights:', error);
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
        const resourceLink = generateResourceLink(resource);
        if (resourceLink.hasValidLink && resourceLink.url) {
          formattedResources.push({ 
            name: resourceLink.title, 
            url: resourceLink.url 
          });
        } else {
          // Add the resource title even if no valid link is found
          formattedResources.push({ 
            name: resourceLink.title || resource, 
            url: null 
          });
        }
      }
    });
    
    return formattedResources;
  };

  const parsedInsights = insights ? parseInsights(insights) : null;

  return (
    <Document>
      {/* Page 1 - Header, Profile, and Chart */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="/lovable-uploads/db40277e-6ff0-437e-acf2-faaa2d92671e.png"
          />
          <Text style={styles.title}>Leader Leap Assessment Results</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
        </View>

        <Text style={styles.sectionTitle}>Profile Summary</Text>
        {demographics?.role && (
          <Text style={styles.text}><Text style={styles.boldText}>Role:</Text> {demographics.role}</Text>
        )}
        {demographics?.yearsOfExperience && (
          <Text style={styles.text}><Text style={styles.boldText}>Years of Experience:</Text> {demographics.yearsOfExperience}</Text>
        )}
        {demographics?.industry && (
          <Text style={styles.text}><Text style={styles.boldText}>Industry:</Text> {demographics.industry}</Text>
        )}
        <Text style={styles.text}><Text style={styles.boldText}>Overall Development Gap:</Text> {averageGap.toFixed(2)} points</Text>
        <Text style={styles.text}>Assessment completed across {categories.length} competency areas</Text>

        {/* Enhanced Chart section with better error handling and 11:11 version logic restoration */}
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
              <Text style={[styles.text, { fontSize: 10, color: '#64748b', marginTop: 10 }]}>
                Chart image could not be captured - this may indicate a technical issue with chart rendering
              </Text>
            </View>
          )}
        </View>
      </Page>

      {/* Page 2 - AI Insights */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
        <Text style={styles.leftAlignedSubtitle}>Personalized leadership development insights powered by EncouragerGPT</Text>

        {parsedInsights ? (
          <View>
            {/* Assessment Summary */}
            {parsedInsights.summary && (
              <View>
                <Text style={styles.subsectionTitle}>Assessment Summary</Text>
                <Text style={styles.text}>{parsedInsights.summary}</Text>
              </View>
            )}

            {/* Priority Development Areas with clickable resource links */}
            {parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Top 3 Priority Development Areas</Text>
                {parsedInsights.priority_areas.map((area, index) => {
                  // Enhanced null checking for area
                  if (!area || typeof area !== 'object') {
                    console.warn(`ReactPDFDocument: Invalid area at index ${index}`);
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
                    <View key={index} style={styles.priorityItem}>
                      <Text style={styles.boldText}>
                        {index + 1}. {area.competency || 'Unknown Competency'} (Gap: {(area.gap || 0).toFixed(1)})
                      </Text>
                      <Text style={styles.boldText}>Key insights:</Text>
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

      {/* Page 3 - Key Strengths and Next Steps */}
      <Page size="A4" style={styles.page}>
        {parsedInsights?.key_strengths && parsedInsights.key_strengths.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Key Competencies to Leverage</Text>
            {parsedInsights.key_strengths.map((strength, index) => {
              // Enhanced null checking for strength
              if (!strength || typeof strength !== 'object') {
                console.warn(`ReactPDFDocument: Invalid strength at index ${index}`);
                return null;
              }

              // Parse and format resources for strengths
              const formattedResources = parseAndFormatResources(strength.resources || []);

              return (
                <View key={index} style={styles.strengthItem}>
                  <Text style={styles.boldText}>Competency: {strength.competency || 'Unknown Competency'}</Text>
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

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recommended Next Steps</Text>
        <Text style={styles.listItem}>• Consider using this report in your next 1:1 with your manager or mentor as a guide for your professional development</Text>
        <Text style={styles.listItem}>• Create a 6 month action plan to address your most critical competency gaps and schedule a time to re-take this assessment to track your progress</Text>
        <Text style={styles.listItem}>• Set an actionable goal for yourself within the next week, and set a reminder to help hold yourself accountable for taking that next step</Text>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Professional Development Coaching</Text>
        
        <View style={styles.coachingContainer}>
          <View style={styles.coachingText}>
            <Text style={styles.text}>Ready to take your leadership skills to the next level? Our expert coaches can help you:</Text>
            <Text style={styles.listItem}>• Learn how to lean into your strengths to achieve your goals</Text>
            <Text style={styles.listItem}>• Understand yourself better and eliminate self-limiting beliefs or obstacles that hold you back</Text>
            <Text style={styles.listItem}>• Establish accountability for practice and reflection</Text>
            
            <Text style={[styles.boldText, { marginTop: 10 }]}>Book a free 30-minute discovery call now</Text>
            <Text style={styles.linkText}>www.encouragercoaching.com</Text>
            
            {/* Bottom logo - left-aligned and matching top logo size (fixed from user request) */}
            <Image 
              style={styles.bottomLogo}
              src="/lovable-uploads/db40277e-6ff0-437e-acf2-faaa2d92671e.png"
            />
          </View>
          
          <Image 
            style={styles.coachingImage}
            src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png"
          />
        </View>

        <Text style={styles.footer}>
          Leader Leap Assessment Tool • Generated on {currentDate}{'\n'}
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </Text>
      </Page>
    </Document>
  );
};

export default ReactPDFDocument;
