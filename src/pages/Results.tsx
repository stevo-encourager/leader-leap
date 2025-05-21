
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircleGauge } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import AuthSection from '@/components/assessment/AuthSection';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ResultsDisplay from '@/components/assessment/ResultsDisplay';
import { useAssessment } from '@/hooks/useAssessment';
import { getAssessmentById } from '@/services/assessmentService';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { toast } from '@/hooks/use-toast';

const Results = () => {
  const navigate = useNavigate();
  const { id: assessmentId } = useParams(); // Get the assessment ID from URL if available
  const [loadingSpecificAssessment, setLoadingSpecificAssessment] = useState(false);
  const [specificAssessmentData, setSpecificAssessmentData] = useState<{ 
    categories: Category[], 
    demographics: Demographics 
  } | null>(null);
  
  const {
    currentStep,
    categories,
    demographics,
    showAuthForm,
    handleCloseAuthForm,
    handleShowSignupForm,
    handleStartAssessment,
    handleBackToDemographics
  } = useAssessment();
  
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log("Results page - assessment ID:", assessmentId);
    console.log("Results page - current categories:", categories);
    
    // If there's an assessment ID in the URL, fetch that specific assessment
    if (assessmentId) {
      const fetchSpecificAssessment = async () => {
        setLoadingSpecificAssessment(true);
        try {
          const result = await getAssessmentById(assessmentId);
          console.log("Specific assessment fetch result:", result);
          
          if (result.success && result.data) {
            // Extract categories and demographics from the result
            const { categories, demographics } = result.data;
            console.log("Loaded specific assessment categories:", categories);
            
            if (categories && Array.isArray(categories)) {
              setSpecificAssessmentData({
                categories: categories as unknown as Category[],
                demographics: demographics as unknown as Demographics || {}
              });
            } else {
              console.error("Invalid categories data format:", categories);
              toast({
                title: "Error loading assessment",
                description: "The assessment data format is invalid",
                variant: "destructive",
              });
            }
          } else {
            console.error("Failed to fetch assessment:", result.error);
            toast({
              title: "Error loading assessment",
              description: result.error || "Failed to load the requested assessment",
              variant: "destructive",
            });
            navigate('/previous-assessments');
          }
        } catch (error) {
          console.error("Error fetching specific assessment:", error);
          toast({
            title: "Error",
            description: "Failed to load the assessment",
            variant: "destructive",
          });
        } finally {
          setLoadingSpecificAssessment(false);
        }
      };
      
      fetchSpecificAssessment();
    }
  }, [assessmentId, navigate]);

  // Wait for auth and data to initialize before rendering
  if (loading || loadingSpecificAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CircleGauge className="text-encourager animate-spin mx-auto" size={32} />
          <p className="mt-2 text-slate-500">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  // Determine which categories and demographics to display
  const displayCategories = assessmentId && specificAssessmentData 
    ? specificAssessmentData.categories 
    : categories;
    
  const displayDemographics = assessmentId && specificAssessmentData 
    ? specificAssessmentData.demographics 
    : demographics;

  console.log("Rendering Results with categories:", displayCategories);

  // Check if we have valid categories data to display
  const hasValidCategories = displayCategories && 
    Array.isArray(displayCategories) && 
    displayCategories.length > 0 &&
    displayCategories[0].skills &&
    Array.isArray(displayCategories[0].skills);

  if (assessmentId && !hasValidCategories) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Unable to load assessment results</h1>
            <p className="text-gray-600 mb-6">The assessment data could not be loaded or has an invalid format.</p>
            <Button onClick={() => navigate('/previous-assessments')} className="bg-encourager hover:bg-encourager-light">
              Back to Previous Assessments
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="assessment-container max-w-5xl mx-auto px-4 py-8">
        {/* User header (when logged in) */}
        <UserHeader />
        
        {/* Show auth form when user tries to save results without being logged in */}
        {showAuthForm && (
          <AuthSection onClose={handleCloseAuthForm} />
        )}
        
        {/* Results content */}
        {!showAuthForm && (
          <ResultsDisplay
            categories={displayCategories}
            demographics={displayDemographics}
            onRestart={() => {
              handleStartAssessment();
              navigate('/assessment');
            }}
            onBack={() => {
              if (assessmentId) {
                navigate('/previous-assessments');
              } else {
                handleBackToDemographics();
                navigate('/assessment');
              }
            }}
            onSignup={handleShowSignupForm}
            isAuthenticated={!!user}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Results;
