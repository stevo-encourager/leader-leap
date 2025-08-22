
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/pagination';
import { AlertTriangle } from 'lucide-react';
import DeleteAssessmentDialog from './DeleteAssessmentDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentRecord {
  id: string;
  created_at: string;
  completed?: boolean;
  hasValidData?: boolean;
}

interface AssessmentsListProps {
  assessments: AssessmentRecord[];
  currentPage: number;
  pageSize: number;
  totalAssessments: number;
  onPageChange: (page: number) => void;
  onDeleteAssessment?: (id: string) => Promise<void>;
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
  onDeleteAssessment,
  validateAssessment
}: AssessmentsListProps) => {
  const isMobile = useIsMobile();
  const totalPages = Math.ceil(totalAssessments / pageSize);
  
  return (
    <div className={`space-y-6 ${isMobile ? 'w-full max-w-full overflow-hidden' : ''}`}>
      <Table className={isMobile ? 'w-full max-w-full table-fixed' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead className={isMobile ? 'w-1/2' : ''}>Date & Time Completed</TableHead>
            <TableHead className={`text-right ${isMobile ? 'w-1/2' : ''}`}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-6">
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
                      {assessment.completed === false && (
                        <span className="text-xs text-amber-500 mt-1">(incomplete)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right ${isMobile ? 'whitespace-nowrap' : 'flex justify-end items-center gap-2'}`}>
                    {assessment.hasValidData === false ? (
                      <div className={`${isMobile ? 'flex items-center justify-end gap-1' : 'flex items-center justify-end gap-2'}`}>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-600">Invalid data</span>
                      </div>
                    ) : assessment.completed === false ? (
                      <div className={`${isMobile ? 'flex items-center justify-end gap-1' : 'flex items-center justify-end gap-2'}`}>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-600">Incomplete assessment</span>
                      </div>
                    ) : (
                      <div className={`${isMobile ? 'flex items-center justify-end gap-2' : 'flex items-center justify-end gap-2'}`}>
                        <Link to={`/results/${assessment.id}`}>
                          <Button 
                            size="sm" 
                            className="bg-encourager hover:bg-encourager-light"
                          >
                            {isMobile ? 'View' : 'View Results'}
                          </Button>
                        </Link>
                        {onDeleteAssessment && assessment.id !== '4a404fb0-311d-464b-8278-10df1b151ea4' && assessment.id !== 'b11beb1e-b6d6-4204-91f7-5673ed90dce5' && (
                          <DeleteAssessmentDialog
                            assessmentId={assessment.id}
                            onDeleteAssessment={onDeleteAssessment}
                          />
                        )}
                      </div>
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
