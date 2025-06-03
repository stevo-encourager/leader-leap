
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { getLatestAssessmentResults } from '@/services/assessment/fetchAssessment';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import AIInsights from '@/components/dashboard/AIInsights';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssessmentLoading from '@/components/assessment/AssessmentLoading';

const AITestPanel = () => {
  // CRITICAL DEBUG: Log at the very top of AITestPanel
  console.log('🔍 🚨 AI TEST PANEL - COMPONENT RENDER START');

  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [assessmentId, setAssessmentId] = useState<string | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // CRITICAL DEBUG: Log state values
  console.log('🔍 🚨 AI TEST PANEL - STATE VALUES:', {
    user: !!user,
    loading,
    categories: categories?.length || 0,
    demographics: Object.keys(demographics || {}),
    assessmentId,
    isLoadingData,
    error,
    refreshKey
  });

  // Check if we're in development/staging (not production)
  const isDevelopment = import.meta.env.DEV || window.location.hostname !== 'your-production-domain.com';

  useEffect(() => {
    // Redirect to home if not in development/staging
    if (!isDevelopment) {
      navigate('/');
      return;
    }

    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login');
      return;
    }

    loadLatestAssessment();
  }, [user, loading, navigate, isDevelopment]);

  const loadLatestAssessment = async () => {
    if (!user) return;

    setIsLoadingData(true);
    setError(null);

    try {
      console.log('AITestPanel: Loading latest assessment data');
      const result = await getLatestAssessmentResults();

      if (result.success && result.data) {
        console.log('AITestPanel: Successfully loaded assessment data');
        console.log('AITestPanel: Assessment ID:', result.data.id);
        setCategories(result.data.categories);
        setDemographics(result.data.demographics);
        setAssessmentId(result.data.id); // Use 'id' instead of 'assessmentId'
      } else {
        console.error('AITestPanel: Failed to load assessment data:', result.error);
        setError(result.error || 'Failed to load assessment data');
      }
    } catch (err) {
      console.error('AITestPanel: Error loading assessment:', err);
      setError('An unexpected error occurred while loading assessment data');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRefreshInsights = () => {
    console.log('AITestPanel: Refreshing insights by incrementing key');
    setRefreshKey(prev => prev + 1);
  };

  // CRITICAL DEBUG: Log before any early returns
  console.log('🔍 🚨 AI TEST PANEL - BEFORE EARLY RETURNS:', {
    loading,
    user: !!user,
    isDevelopment,
    isLoadingData,
    error
  });

  // Wait for auth check
  if (loading) {
    console.log('🔍 🚨 AI TEST PANEL - RETURNING LOADING STATE');
    return <AssessmentLoading />;
  }

  // Redirect if not authenticated or not in dev/staging
  if (!user || !isDevelopment) {
    console.log('🔍 🚨 AI TEST PANEL - RETURNING NULL (NO USER OR NOT DEV)');
    return null;
  }

  // Show loading while fetching data
  if (isLoadingData) {
    console.log('🔍 🚨 AI TEST PANEL - RETURNING LOADING DATA STATE');
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <UserHeader />
          <AssessmentLoading />
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    console.log('🔍 🚨 AI TEST PANEL - RETURNING ERROR STATE');
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <UserHeader />
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}. Please ensure you have completed at least one assessment.
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => navigate('/assessment')} className="mr-4">
              Take Assessment
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate metrics for insights
  const averageGap = calculateAverageGap(categories);

  // CRITICAL DEBUG: Log before main render
  console.log('🔍 🚨 AI TEST PANEL - ABOUT TO RENDER MAIN CONTENT:', {
    categories: categories?.length || 0,
    demographics: Object.keys(demographics || {}),
    assessmentId,
    averageGap
  });

  console.log('🔍 🚨 AI TEST PANEL - NOTE: This page only renders AIInsights, NOT ResultsActions!');
  console.log('🔍 🚨 AI TEST PANEL - ResultsActions is only on the main Results page, not the test panel!');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-2">
        <Navigation />
      </div>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <UserHeader />
        
        {/* Test Panel Header */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Bot className="text-yellow-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-800 font-playfair">AI Insights Test Panel</h1>
                <p className="text-yellow-700 mt-1">
                  Testing environment for AI insights generation • Assessment ID: {assessmentId || 'Not available'}
                </p>
              </div>
            </div>
            <Button onClick={handleRefreshInsights} className="flex items-center gap-2">
              <RefreshCw size={16} />
              Regenerate Insights
            </Button>
          </div>
        </div>

        {/* AI Insights Section - identical to live dashboard */}
        <div className="space-y-8">
          <div key={`ai-insights-${refreshKey}`}>
            <AIInsights 
              categories={categories}
              demographics={demographics}
              averageGap={averageGap}
              assessmentId={assessmentId} // Now correctly using the 'id' from the assessment
            />
          </div>
        </div>

        {/* Test Panel Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Test Panel Information</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Using data from your latest completed assessment (ID: {assessmentId || 'N/A'})</li>
            <li>• Click "Regenerate Insights" to test prompt changes</li>
            <li>• Insights will be saved to the assessment if successful</li>
            <li>• Available only in development/staging environments</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AITestPanel;
