import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getAssessmentHistory, deleteAllCompletedAssessments } from '@/services/assessmentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CircleGauge, ArrowLeft, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { toast } from '@/hooks/use-toast';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface AssessmentRecord {
  id: string;
  created_at: string;
}

const PreviousAssessments = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      console.log("PreviousAssessments - Fetching assessments...");
      const result = await getAssessmentHistory();
      console.log('PreviousAssessments - Assessment history fetch result:', result);
      
      if (result.success && result.data) {
        // Enhanced deduplication: Using a Map to ensure we keep only the most recent assessment
        // when there are multiple entries with the same ID
        const uniqueAssessments = new Map<string, AssessmentRecord>();
        
        // Process from newest to oldest (already sorted in the service)
        result.data.forEach(assessment => {
          // Only add if we haven't seen this ID yet
          if (!uniqueAssessments.has(assessment.id)) {
            uniqueAssessments.set(assessment.id, assessment);
          }
        });
        
        // Convert map values back to array
        const finalAssessments = Array.from(uniqueAssessments.values());
        
        console.log('PreviousAssessments - After deduplication:', finalAssessments);
        console.log('PreviousAssessments - Original count:', result.data.length, 'Final count:', finalAssessments.length);
        
        setAssessments(finalAssessments);
      } else {
        console.error('PreviousAssessments - Failed to fetch history:', result.error);
        toast({
          title: "Error fetching assessments",
          description: result.error || "Failed to load your assessment history",
          variant: "destructive",
        });
        setAssessments([]);
      }
    } catch (error) {
      console.error('PreviousAssessments - Error in fetchAssessments:', error);
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

  useEffect(() => {
    // Check if user is authenticated
    if (loading) {
      return; // Wait for auth to initialize
    }
    
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch assessment history if user is authenticated
    fetchAssessments();
  }, [user, navigate, loading]);

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

  // Show loading state while auth is initializing or fetching data
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading your previous assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
          
          {assessments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
              </span>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={isDeleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? "Deleting..." : "Delete All"}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all assessments</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All your completed assessment data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAllAssessments}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-encourager mb-8">Your Previous Assessments</h1>

        {assessments.length === 0 ? (
          <Card className="p-6 text-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-4">
                <CircleGauge className="text-encourager animate-spin" size={32} />
                <p className="mt-2 text-slate-500">Loading your assessments...</p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-slate-600">You haven't completed any assessments yet.</p>
                <Link to="/assessment">
                  <Button className="bg-encourager hover:bg-encourager-light">
                    Start an Assessment
                  </Button>
                </Link>
              </>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div
                    className="w-full p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <h3 className="font-medium text-lg text-encourager">
                        Leadership Gap Assessment
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Completed on {formatDate(assessment.created_at)}
                      </p>
                      <p className="text-slate-400 text-xs">
                        ID: {assessment.id}
                      </p>
                    </div>
                    <Link to={`/results/${assessment.id}`}>
                      <Button 
                        size="sm" 
                        className="bg-encourager hover:bg-encourager-light"
                      >
                        View Results
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PreviousAssessments;
