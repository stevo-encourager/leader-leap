import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#69bda2',
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
    color: '#69bda2',
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
}

const ActionPlanSummaryPDF: React.FC<ActionPlanSummaryPDFProps> = ({
  goals,
  milestones,
  userName
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
            src="/lovable-uploads/db40277e-6ff0-437e-acf2-faaa2d92671e.png"
          />
          <Text style={styles.title}>Leader Leap Action Plan Summary</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
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
                  {goal.completed ? '✓' : '✗'}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyMessage}>
            No short-term goals have been created yet. Create goals in your action plan to see them here.
          </Text>
        )}

        {/* Quarterly Milestones Section */}
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
                  {milestone.completed ? '✓' : '✗'}
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
    </Document>
  );
};

export default ActionPlanSummaryPDF; 