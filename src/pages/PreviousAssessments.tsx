
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleGauge, ArrowLeft, Plus } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import AssessmentsList from '@/components/previous-assessments/AssessmentsList';
import EmptyAssessmentsList from '@/components/previous-assessments/EmptyAssessmentsList';
import { toast } from '@/hooks/use-toast';

const PreviousAssessments = () => {
  const navigate = useNavigate();
  const { 
    user, 
    assessments,
    allAssessments,
    isLoading, 
    isDeleting,
    totalAssessments,
    currentPage,
    pageSize,
    fetchAssessments, 
    handleDeleteAssessment,
    handlePageChange
  } = useAssessmentHistory();

  // Tracking the timestamp of the last loaded assessments
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch assessment history if user is authenticated
    fetchAssessments();
    setLastRefreshed(new Date().toISOString());
  }, [user, navigate]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchAssessments();
    setLastRefreshed(new Date().toISOString());
    toast({
      title: "Assessment list refreshed",
      description: "Showing all your assessments in chronological order"
    });
  };

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
          
          <div className="flex items-center gap-3">
            <Link to="/assessment">
              <Button variant="encourager" className="flex items-center gap-2">
                <Plus size={16} />
                <span>Start New Assessment</span>
              </Button>
            </Link>
            
            {allAssessments.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isLoading}
              >
                Refresh List
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-encourager mb-8">Your Previous Assessments</h1>

        {allAssessments.length === 0 ? (
          <EmptyAssessmentsList isLoading={isLoading} />
        ) : (
          <>
            <AssessmentsList 
              assessments={assessments} 
              currentPage={currentPage}
              pageSize={pageSize}
              totalAssessments={totalAssessments}
              onPageChange={handlePageChange}
              onDeleteAssessment={handleDeleteAssessment}
            />
            
            {lastRefreshed && (
              <p className="mt-4 text-xs text-slate-400 text-right">
                Last updated: {new Date(lastRefreshed).toLocaleTimeString()}
                {' | '}
                Showing page {currentPage} of {Math.ceil(totalAssessments / pageSize)}
              </p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PreviousAssessments;
