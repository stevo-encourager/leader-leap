
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { AlertTriangle } from 'lucide-react';

interface AssessmentRecord {
  id: string;
  created_at: string;
  hasValidData?: boolean;
}

interface AssessmentsListProps {
  assessments: AssessmentRecord[];
  currentPage: number;
  pageSize: number;
  totalAssessments: number;
  onPageChange: (page: number) => void;
  validateAssessment?: (id: string) => Promise<boolean>;
}

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  };
};

const AssessmentsList = ({ 
  assessments,
  currentPage,
  pageSize,
  totalAssessments,
  onPageChange,
  validateAssessment
}: AssessmentsListProps) => {
  const totalPages = Math.ceil(totalAssessments / pageSize);
  
  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time Completed</TableHead>
            <TableHead>Assessment ID</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6">
                No assessments found
              </TableCell>
            </TableRow>
          ) : (
            assessments.map((assessment) => {
              const { date, time } = formatDateTime(assessment.created_at);
              return (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-sm">{date}</span>
                      <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {assessment.id}
                  </TableCell>
                  <TableCell className="text-right">
                    {assessment.hasValidData === false ? (
                      <div className="flex items-center justify-end gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-600">Invalid data</span>
                      </div>
                    ) : (
                      <Link to={`/results/${assessment.id}`}>
                        <Button 
                          size="sm" 
                          className="bg-encourager hover:bg-encourager-light"
                        >
                          View Results
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
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
        Showing {assessments.length} of {totalAssessments} total assessments
      </div>
    </div>
  );
};

export default AssessmentsList;
