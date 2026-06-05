import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';

// Define styles for Action Plan Summary PDF
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 10,
    lineHeight: 1.3,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  descriptionCell: {
    flex: 3,
    paddingRight: 8,
  },
  dateCell: {
    flex: 1,
    textAlign: 'center',
  },
  statusCell: {
    flex: 1,
    textAlign: 'center',
  },
  completedText: {
    color: '#059669',
    fontWeight: 'bold',
  },
  incompleteText: {
    color: '#6b7280',
  },
  emptyMessage: {
    fontSize: 11,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 1.4,
    marginBottom: 12,
    color: '#374151',
  },
  boldText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coachingSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F9FAF9',
    borderRadius: 8,
  },
  coachingTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  coachingText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 6,
  },
  coachingLink: {
    fontSize: 11,
    color: '#0066CC',
    textDecoration: 'underline',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#6b7280',
  },
  profileSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  profileText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  linkText: {
    color: '#0066CC',
    textDecoration: 'underline',
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
});

interface ActionPlanGoal {
  id: string;
  description: string;
  competency: string;
  targetDate: string;
  completed: boolean;
}

interface ActionPlanMilestone {
  id: string;
  description: string;
  competency: string;
  targetDate: string;
  completed: boolean;
  quarter: string;
}

interface ActionPlanSummaryPDFProps {
  goals: ActionPlanGoal[];
  milestones: ActionPlanMilestone[];
  userName?: string;
  userRole?: string;
  yearsExperience?: string;
  industry?: string;
  averageGap?: number;
}

const ActionPlanSummaryPDF: React.FC<ActionPlanSummaryPDFProps> = ({
  goals,
  milestones,
  userName,
  userRole,
  yearsExperience,
  industry,
  averageGap
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    if (dateString.includes('/')) return dateString; // Already DD/MM/YYYY
    if (dateString.includes('-')) { // YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return dateString;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="/EncouragerLogoNew.png"
          />
          <Text style={styles.title}>Leader Leap Action Plan Summary</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
        </View>

        {/* Profile Summary */}
        <View style={styles.profileSummary}>
          <Text style={styles.profileTitle}>Profile Summary</Text>
          <Text style={styles.profileRow}>
            <Text style={styles.profileLabel}>Name: </Text>
            {userName || 'Not provided'}
          </Text>
          <Text style={styles.profileRow}>
            <Text style={styles.profileLabel}>Role: </Text>
            {userRole || 'Manager'}
          </Text>
          <Text style={styles.profileRow}>
            <Text style={styles.profileLabel}>Years of Experience: </Text>
            {yearsExperience || '4-7 years'}
          </Text>
          <Text style={styles.profileRow}>
            <Text style={styles.profileLabel}>Industry: </Text>
            {industry || 'Technology'}
          </Text>
          <Text style={styles.profileRow}>
            <Text style={styles.profileLabel}>Average Development Gap: </Text>
            {averageGap !== undefined && averageGap > 0 ? `${averageGap.toFixed(2)} points` : '2.27 points'}
          </Text>
        </View>

        {/* Short Term Goals Section */}
        <Text style={styles.sectionTitle}>Short Term Goals</Text>
        <Text style={styles.descriptionText}>
          <Text style={styles.boldText}>Short-term Goals</Text> = specific actions or tasks you'll complete in the next 1-3 months to improve this competency. Think immediate, concrete steps you can take.
        </Text>
        
        {goals.length > 0 ? (
          <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.descriptionCell]}>
                Goal Description
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.dateCell]}>
                Target Date
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.statusCell]}>
                Completed
              </Text>
            </View>
            
            {/* Table Rows */}
            {goals.map((goal, index) => (
              <View key={goal.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.descriptionCell]}>
                  {goal.description}
                </Text>
                <Text style={[styles.tableCell, styles.dateCell]}>
                  {formatDateForDisplay(goal.targetDate)}
                </Text>
                <Text style={[
                  styles.tableCell, 
                  styles.statusCell,
                  goal.completed ? styles.completedText : styles.incompleteText
                ]}>
                  {goal.completed ? 'Yes' : 'No'}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyMessage}>
            No short-term goals have been created yet. Create goals in your action plan to see them here.
          </Text>
        )}

        {/* Quarterly Milestones - continue on same page */}
        <Text style={styles.sectionTitle}>Quarterly Milestones</Text>
        <Text style={styles.descriptionText}>
          <Text style={styles.boldText}>Quarterly Milestones</Text> = measurable outcomes or achievements that show your progress over a 3-month period. They're bigger-picture results that demonstrate you're actually improving in this area.
        </Text>
        
        {milestones.length > 0 ? (
          <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.descriptionCell]}>
                Milestone Description
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.dateCell]}>
                Target Date
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, styles.statusCell]}>
                Completed
              </Text>
            </View>
            
            {/* Table Rows */}
            {milestones.map((milestone, index) => (
              <View key={milestone.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.descriptionCell]}>
                  {milestone.description}
                </Text>
                <Text style={[styles.tableCell, styles.dateCell]}>
                  {formatDateForDisplay(milestone.targetDate)}
                </Text>
                <Text style={[
                  styles.tableCell, 
                  styles.statusCell,
                  milestone.completed ? styles.completedText : styles.incompleteText
                ]}>
                  {milestone.completed ? 'Yes' : 'No'}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyMessage}>
            No quarterly milestones have been created yet. Create milestones in your action plan to see them here.
          </Text>
        )}
      </Page>

      {/* Page 2 - My Profile and Coaching Support */}
      <Page size="A4" style={styles.page}>
        {/* My Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Continue Your Development</Text>
          <Text style={styles.profileText}>
            • Navigate to{' '}
            <Link src="https://www.leader-leap.com/profile" style={styles.linkText}>
              My Profile
            </Link>{' '}
            to create more detailed plans for your competency gaps
          </Text>
          <Text style={styles.profileText}>
            • Track your progress and update your goals regularly
          </Text>
          <Text style={styles.profileText}>
            • Collaborate with your manager, mentor or coach to develop your leadership strategy
          </Text>
        </View>

        {/* Coaching Support Section */}
        <View style={styles.coachingSection}>
          <Text style={styles.coachingTitle}>Get some expert coaching support</Text>
          <Text style={styles.coachingText}>• Learn how to lean into your strengths to achieve your goals</Text>
          <Text style={styles.coachingText}>• Understand yourself better and eliminate self-limiting beliefs or obstacles</Text>
          <Text style={styles.coachingText}>• Establish regular touchpoints for tracking growth and gaining insights</Text>
          <View style={{ marginTop: 10 }}>
            <Link src="https://www.encouragercoaching.com/about" style={styles.coachingLink}>
              <Text>Learn more about me</Text>
            </Link>
            <Link src="https://www.encourager.co.uk/services/executive-coaching" style={styles.coachingLink}>
              <Text>Understand the process</Text>
            </Link>
            <Link src="https://www.encouragercoaching.com/contact" style={[styles.coachingLink, { marginTop: 6 }]}>
              <Text>Book a free 30 minute discovery call</Text>
            </Link>
          </View>
          <View style={{ marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>
              Steve Thompson, Executive Coach • steve.thompson@leader-leap.com
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Leader Leap Action Plan Summary • Generated on {currentDate}
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Encourager Ltd
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ActionPlanSummaryPDF; 