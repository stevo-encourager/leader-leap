
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
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
    maxHeight: 60,
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
    maxWidth: 500, // Increased from 400 to make chart larger
    maxHeight: 500, // Increased from 400 to make chart larger
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
});

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

  // Log chart image data for debugging
  console.log('ReactPDFDocument: Chart image data received:', {
    hasChartData: !!chartImageDataUrl,
    dataUrlLength: chartImageDataUrl?.length || 0,
    dataUrlPreview: chartImageDataUrl?.substring(0, 100) || 'No data'
  });

  const parseInsights = (insightsText: string): AIInsightsData | null => {
    try {
      const parsed = JSON.parse(insightsText);
      if (!parsed.summary || !parsed.priority_areas || !parsed.key_strengths) {
        return null;
      }
      if (!Array.isArray(parsed.priority_areas) || !Array.isArray(parsed.key_strengths)) {
        return null;
      }
      return parsed;
    } catch (error) {
      console.error('Error parsing insights:', error);
      return null;
    }
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
          <Text style={styles.title}>Leadership Assessment Results</Text>
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

        {/* Chart section with larger sizing */}
        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Competency Analysis - Radar Chart</Text>
        
        <View style={styles.chartContainer}>
          {chartImageDataUrl ? (
            <>
              <Image 
                style={styles.chartImage}
                src={chartImageDataUrl}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#2F564D' }]} />
                  <Text style={styles.legendText}>Current State</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#8baca5' }]} />
                  <Text style={styles.legendText}>Desired State</Text>
                </View>
              </View>
            </>
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
        <Text style={styles.subtitle}>Personalized leadership development insights powered by Encourager GPT</Text>

        {parsedInsights ? (
          <View>
            {/* Assessment Summary */}
            {parsedInsights.summary && (
              <View>
                <Text style={styles.subsectionTitle}>Assessment Summary</Text>
                <Text style={styles.text}>{parsedInsights.summary}</Text>
              </View>
            )}

            {/* Priority Development Areas */}
            {parsedInsights.priority_areas && parsedInsights.priority_areas.length > 0 && (
              <View>
                <Text style={styles.subsectionTitle}>Top 3 Priority Development Areas</Text>
                {parsedInsights.priority_areas.map((area, index) => {
                  const resourceLink = generateResourceLink(area.resource);
                  return (
                    <View key={index} style={styles.priorityItem}>
                      <Text style={styles.boldText}>
                        {index + 1}. {area.competency} (Gap: {area.gap.toFixed(1)})
                      </Text>
                      <Text style={styles.boldText}>Key insights:</Text>
                      {area.insights && Array.isArray(area.insights) && area.insights.map((insight, insightIndex) => (
                        <Text key={insightIndex} style={styles.listItem}>• {insight}</Text>
                      ))}
                      {area.resource && (
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Recommended Resource:</Text> {resourceLink.title}
                        </Text>
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
            {parsedInsights.key_strengths.map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Text style={styles.boldText}>Competency: {strength.competency}</Text>
                <Text style={styles.text}>Existing Skill: {strength.example}</Text>
                <Text style={styles.boldText}>How to leverage further:</Text>
                {strength.leverage_advice && Array.isArray(strength.leverage_advice) && strength.leverage_advice.map((advice, adviceIndex) => (
                  <Text key={adviceIndex} style={styles.listItem}>• {advice}</Text>
                ))}
              </View>
            ))}
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
            <Text style={styles.listItem}>• Create personalized development plans</Text>
            <Text style={styles.listItem}>• Practice new skills in a safe environment</Text>
            <Text style={styles.listItem}>• Overcome specific leadership challenges</Text>
            <Text style={styles.listItem}>• Track your progress over time</Text>
            
            <Text style={[styles.boldText, { marginTop: 10 }]}>Book a free 30-minute discovery call now</Text>
            <Text style={styles.linkText}>www.encouragercoaching.com</Text>
          </View>
          
          <Image 
            style={styles.coachingImage}
            src="/lovable-uploads/b35e005b-ec23-4976-8796-738f7c856377.png"
          />
        </View>

        <Text style={styles.footer}>
          Leadership Assessment Tool • Generated on {currentDate}{'\n'}
          This assessment is designed to help you identify development opportunities and create targeted improvement plans.
        </Text>
      </Page>
    </Document>
  );
};

export default ReactPDFDocument;
