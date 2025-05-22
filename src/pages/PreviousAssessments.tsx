
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleGauge, ArrowLeft } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import AssessmentsList from '@/components/previous-assessments/AssessmentsList';
import EmptyAssessmentsList from '@/components/previous-assessments/EmptyAssessmentsList';
import DeleteAllAssessmentsDialog from '@/components/previous-assessments/DeleteAllAssessmentsDialog';

const PreviousAssessments = () => {
  const navigate = useNavigate();
  const { 
    user, 
    assessments, 
    isLoading, 
    isDeleting, 
    fetchAssessments, 
    handleDeleteAllAssessments 
  } = useAssessmentHistory();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch assessment history if user is authenticated
    fetchAssessments();
  }, [user, navigate]);

  // Show loading state while fetching data
  if (isLoading) {
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
              
              <DeleteAllAssessmentsDialog 
                isDeleting={isDeleting}
                onDeleteAll={handleDeleteAllAssessments}
              />
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold text-encourager mb-8">Your Previous Assessments</h1>

        {assessments.length === 0 ? (
          <EmptyAssessmentsList isLoading={isLoading} />
        ) : (
          <AssessmentsList assessments={assessments} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PreviousAssessments;
