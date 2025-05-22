
import React from 'react';
import AssessmentListItem from './AssessmentListItem';

interface AssessmentRecord {
  id: string;
  created_at: string;
}

interface AssessmentsListProps {
  assessments: AssessmentRecord[];
}

const AssessmentsList = ({ assessments }: AssessmentsListProps) => {
  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <AssessmentListItem 
          key={assessment.id} 
          id={assessment.id} 
          created_at={assessment.created_at} 
        />
      ))}
    </div>
  );
};

export default AssessmentsList;
