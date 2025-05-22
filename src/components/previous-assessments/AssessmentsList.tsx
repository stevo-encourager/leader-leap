import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
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

// Helper function to group assessments by date (YYYY-MM-DD)
const groupAssessmentsByDate = (assessments: AssessmentRecord[]) => {
  const grouped = new Map<string, AssessmentRecord>();
  
  // For each assessment, keep only the latest one per day
  assessments.forEach(assessment => {
    const dateKey = new Date(assessment.created_at).toISOString().split('T')[0];
    
    if (!grouped.has(dateKey) || 
        new Date(assessment.created_at) > new Date(grouped.get(dateKey)!.created_at)) {
      grouped.set(dateKey, assessment);
    }
  });
  
  // Convert back to array and sort by date (newest first)
  return Array.from(grouped.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const AssessmentsList = ({ 
  assessments,
  currentPage,
  pageSize,
  totalAssessments,
  onPageChange
}: AssessmentsListProps) => {
  // Group assessments by date to show only one per day
  const uniqueAssessments = groupAssessmentsByDate(assessments);
  
  // Recalculate total pages based on unique assessments
  const uniqueTotal = uniqueAssessments.length;
  const totalPages = Math.ceil(uniqueTotal / pageSize);
  
  // Get the paginated subset of unique assessments
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAssessments = uniqueAssessments.slice(startIndex, startIndex + pageSize);
  
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date Completed</TableHead>
            <TableHead>Assessment ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedAssessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                No assessments found
              </TableCell>
            </TableRow>
          ) : (
            paginatedAssessments.map((assessment) => (
              <TableRow key={assessment.id}>
                <TableCell className="font-medium">
                  {formatDate(assessment.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {assessment.id}
                </TableCell>
                <TableCell className="text-right">
                  <Link to={`/results/${assessment.id}`}>
                    <Button 
                      size="sm" 
                      className="bg-encourager hover:bg-encourager-light"
                    >
                      View Results
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
      
      <div className="text-xs text-slate-500 mt-2">
        Showing {paginatedAssessments.length} unique assessments (grouped by day)
        {uniqueTotal < totalAssessments && ` out of ${totalAssessments} total assessments`}
      </div>
    </div>
  );
};

export default AssessmentsList;
