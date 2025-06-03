
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import UserHeader from '@/components/auth/UserHeader';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { getSpecificAssessmentResults } from '@/services/assessment/fetchAssessment';
import { Category, Demographics } from '@/utils/assessmentTypes';
import { calculateAverageGap } from '@/utils/assessmentCalculations/averages';
import AIInsights from '@/components/dashboard/AIInsights';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Bot, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssessmentLoading from '@/components/assessment/AssessmentLoading';

const AITestPanel = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [demographics, setDemographics] = useState<Demographics>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // FIXED: Remove the regenerateCallback state - use direct reference instead
  // This was causing the "f is not a function" error

  // FIXED: Use only the specific test assessment ID
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';

  // Check if we're in development/staging (not production)
  const isDevelopment = import.meta.env.DEV || window.location.hostname !== 'your-production-domain.com';

  // Calculate metrics for insights
  const averageGap = calculateAverageGap(categories);

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

    loadTestAssessment();
  }, [user, loading, navigate, isDevelopment]);

  const loadTestAssessment = async () => {
    if (!user) return;

    setIsLoadingData(true);
    setError(null);

    try {
      console.log('AITestPanel: Loading test assessment data for ID:', TEST_ASSESSMENT_ID);
      const result = await getSpecificAssessmentResults(TEST_ASSESSMENT_ID);

      if (result.success && result.data) {
        console.log('AITestPanel: Successfully loaded test assessment data');
        console.log('AITestPanel: Test Assessment ID:', result.data.id);
        setCategories(result.data.categories);
        setDemographics(result.data.demographics);
      } else {
        console.error('AITestPanel: Failed to load test assessment data:', result.error);
        setError(result.error || 'Failed to load test assessment data');
      }
    } catch (err) {
      console.error('AITestPanel: Error loading test assessment:', err);
      setError('An unexpected error occurred while loading test assessment data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // FIXED: Create a ref to store the regenerate function directly
  const regenerateFunctionRef = React.useRef<(() => Promise<void>) | null>(null);

  const handleRefreshInsights = async () => {
    console.log('🔴 AITestPanel: Regenerate Insights button clicked - FIRST LINE OF HANDLER');
    console.log('🔴 AITestPanel: Current refreshKey before increment:', refreshKey);
    console.log('🔴 AITestPanel: regenerateFunctionRef.current available:', !!regenerateFunctionRef.current);
    console.log('🔴 AITestPanel: regenerateFunctionRef.current type:', typeof regenerateFunctionRef.current);
    
    // FIXED: Call the function directly from the ref
    if (regenerateFunctionRef.current && typeof regenerateFunctionRef.current === 'function') {
      console.log('🔴 AITestPanel: Calling regeneration function directly');
      try {
        await regenerateFunctionRef.current();
        console.log('🔴 AITestPanel: Regeneration function completed successfully');
      } catch (error) {
        console.error('🔴 AITestPanel: Regeneration function failed:', error);
      }
    } else {
      console.log('🔴 AITestPanel: No valid regeneration function available, forcing re-render');
      // Fallback: force a re-render to try again
      setRefreshKey(prev => prev + 1);
    }
    
    console.log('🔴 AITestPanel: handleRefreshInsights completed');
  };

  // FIXED: Callback function that receives the regeneration function
  const handleRegenerateCallback = React.useCallback((regenerateFunction: () => Promise<void>) => {
    console.log('🔴 AITestPanel: Received regeneration callback, type:', typeof regenerateFunction);
    console.log('🔴 AITestPanel: Is function?', typeof regenerateFunction === 'function');
    
    if (typeof regenerateFunction === 'function') {
      regenerateFunctionRef.current = regenerateFunction;
      console.log('🔴 AITestPanel: Stored regeneration function in ref');
    } else {
      console.error('🔴 AITestPanel: Received invalid regeneration callback - not a function');
      regenerateFunctionRef.current = null;
    }
  }, []);

  // Wait for auth check
  if (loading) {
    return <AssessmentLoading />;
  }

  // Redirect if not authenticated or not in dev/staging
  if (!user || !isDevelopment) {
    return null;
  }

  // Show loading while fetching data
  if (isLoadingData) {
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
              {error}. Please ensure the test assessment exists and is accessible.
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

  console.log('🔴 AITestPanel: Rendering with refreshKey:', refreshKey);

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
                  Testing environment for AI insights generation • Test Assessment ID: {TEST_ASSESSMENT_ID}
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
              assessmentId={TEST_ASSESSMENT_ID}
              onRegenerateCallback={handleRegenerateCallback}
            />
          </div>
        </div>

        {/* Test Panel Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Test Panel Information</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Using data from test assessment (ID: {TEST_ASSESSMENT_ID})</li>
            <li>• Click "Regenerate Insights" to test prompt changes</li>
            <li>• Insights will be saved to the test assessment if successful</li>
            <li>• Available only in development/staging environments</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AITestPanel;
