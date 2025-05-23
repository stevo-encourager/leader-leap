
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentHistory, deleteAllAssessments, deleteAssessment } from '@/services/assessment/manageAssessmentHistory';
import { toast } from '@/hooks/use-toast';

interface AssessmentRecord {
  id: string;
  created_at: string;
  completed?: boolean;
}

export const useAssessmentHistory = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalAssessments, setTotalAssessments] = useState(0);

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("useAssessmentHistory - Fetching assessments...");
      const result = await getAssessmentHistory();
      console.log('useAssessmentHistory - Assessment history fetch result:', result);
      
      if (result.success && result.data) {
        // Filter out incomplete assessments
        const completedAssessments = result.data.filter(assessment => 
          assessment.completed === true
        );
        
        // Store the total count of completed assessments
        setTotalAssessments(completedAssessments.length);
        
        // Sort by date (newest first) without grouping
        const sortedAssessments = [...completedAssessments].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Set all assessments
        setAssessments(sortedAssessments);
        
        console.log('useAssessmentHistory - Completed assessments count:', sortedAssessments.length);
      } else {
        console.error('useAssessmentHistory - Failed to fetch history:', result.error);
        toast({
          title: "Error fetching assessments",
          description: result.error || "Failed to load your assessment history",
          variant: "destructive",
        });
        setAssessments([]);
      }
    } catch (error) {
      console.error('useAssessmentHistory - Error in fetchAssessments:', error);
      toast({
        title: "Error fetching assessments",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteAssessment = async (assessmentId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteAssessment(assessmentId);
      
      if (result.success) {
        toast({
          title: "Assessment deleted",
          description: "The selected assessment has been deleted",
        });
        
        // Update the assessment list after deletion
        setAssessments(prevAssessments => 
          prevAssessments.filter(assessment => assessment.id !== assessmentId)
        );
        
        // Update total count
        setTotalAssessments(prev => Math.max(0, prev - 1));
        
        // Adjust current page if needed (if last item on page was deleted)
        const currentPageItemCount = assessments.filter(
          (_, index) => 
            index >= (currentPage - 1) * pageSize && 
            index < currentPage * pageSize
        ).length;
        
        if (currentPageItemCount === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } else {
        toast({
          title: "Error deleting assessment",
          description: result.error || "Failed to delete the assessment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error deleting assessment",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllAssessments = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllAssessments();
      
      if (result.success) {
        toast({
          title: "Assessments deleted",
          description: "All your completed assessments have been deleted",
        });
        // Reset pagination and assessments
        setCurrentPage(1);
        setAssessments([]);
        setTotalAssessments(0);
      } else {
        toast({
          title: "Error deleting assessments",
          description: result.error || "Failed to delete your assessments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting assessments:', error);
      toast({
        title: "Error deleting assessments",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get paginated data (now showing all assessments, not grouped)
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    return assessments.slice(startIndex, startIndex + pageSize);
  };

  // Load assessments when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user, fetchAssessments]);

  return {
    user,
    assessments: getPaginatedData(),
    allAssessments: assessments,
    isLoading,
    isDeleting,
    totalAssessments,
    currentPage,
    pageSize,
    fetchAssessments,
    handleDeleteAssessment,
    handleDeleteAllAssessments,
    handlePageChange
  };
};
