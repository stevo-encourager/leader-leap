
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
import KeyInsights from '@/components/dashboard/KeyInsights';
import { 
  getStrengths,
  getLowestSkills
} from '@/utils/assessmentCalculations';
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
        setCategories(result.data.categories);
        setDemographics(result.data.demographics);
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
  const strengths = getStrengths(categories, 5);
  const lowestSkills = getLowestSkills(categories, 5);

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
                  Testing environment for AI insights generation • Latest assessment data loaded
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
              assessmentId={undefined} // No assessment ID for test mode
            />
          </div>

          {/* Key Insights Section - identical to live dashboard */}
          <KeyInsights 
            averageGap={averageGap}
            strengths={strengths}
            lowestSkills={lowestSkills}
            categories={categories}
            demographics={demographics}
          />
        </div>

        {/* Test Panel Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Test Panel Information</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Using data from your latest completed assessment</li>
            <li>• Click "Regenerate Insights" to test prompt changes</li>
            <li>• No data will be saved during testing</li>
            <li>• Available only in development/staging environments</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AITestPanel;
