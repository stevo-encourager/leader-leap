
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AssessmentListItem from './AssessmentListItem';
import { Pagination } from '@/components/ui/pagination';

interface AssessmentRecord {
  id: string;
  created_at: string;
}

interface AssessmentsListProps {
  assessments: AssessmentRecord[];
  currentPage: number;
  pageSize: number;
  totalAssessments: number;
  onPageChange: (page: number) => void;
}

const AssessmentsList = ({ 
  assessments,
  currentPage,
  pageSize,
  totalAssessments,
  onPageChange
}: AssessmentsListProps) => {
  const totalPages = Math.ceil(totalAssessments / pageSize);
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <AssessmentListItem 
            key={assessment.id} 
            id={assessment.id} 
            created_at={assessment.created_at} 
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AssessmentsList;
