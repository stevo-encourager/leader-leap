
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAssessmentHistory, deleteAllCompletedAssessments } from '@/services/assessmentService';
import { toast } from '@/hooks/use-toast';

interface AssessmentRecord {
  id: string;
  created_at: string;
}

export const useAssessmentHistory = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState<number | null>(null);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      console.log("useAssessmentHistory - Fetching assessments...");
      const result = await getAssessmentHistory();
      console.log('useAssessmentHistory - Assessment history fetch result:', result);
      
      if (result.success && result.data) {
        // Store the raw count
        setAssessmentCount(result.data.length);
        
        // Set the deduplicated assessments from the service
        setAssessments(result.data);
        
        console.log('useAssessmentHistory - Final assessments count:', result.data.length);
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
  };

  const handleDeleteAllAssessments = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAllCompletedAssessments();
      
      if (result.success) {
        toast({
          title: "Assessments deleted",
          description: "All your completed assessments have been deleted",
        });
        // Refresh the list
        setAssessments([]);
        setAssessmentCount(0);
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

  return {
    user,
    assessments,
    isLoading,
    isDeleting,
    assessmentCount,
    fetchAssessments,
    handleDeleteAllAssessments
  };
};
