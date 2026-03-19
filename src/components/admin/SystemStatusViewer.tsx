
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/productionLogger';

const SystemStatusViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    userCount: number | null;
    assessmentCount: number | null;
    profileCount: number | null;
    error: string | null;
    lastUpdated: string | null;
  }>({
    userCount: null,
    assessmentCount: null,
    profileCount: null,
    error: null,
    lastUpdated: null
  });

  const fetchStats = async () => {
    setIsLoading(true);

    
    try {
      // Reset error state
      setStats(prev => ({ ...prev, error: null }));
      
      // Fallback to direct database queries since Edge Function is failing
      
      // Get profile count
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profileError) {
        logger.error("SystemStatusViewer: Error getting profile count:", profileError);
        throw new Error(`Error getting profile count: ${profileError.message}`);
      }
      
      // Get assessment count  
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true });
      
      if (assessmentError) {
        logger.error("SystemStatusViewer: Error getting assessment count:", assessmentError);
        throw new Error(`Error getting assessment count: ${assessmentError.message}`);
      }
      
      const timestamp = new Date().toLocaleString();
      
      setStats({
        userCount: null, // Can't access auth.users directly from frontend
        assessmentCount: assessmentCount || 0,
        profileCount: profileCount || 0,
        error: null,
        lastUpdated: timestamp
      });
      

      
    } catch (error: any) {
      logger.error('SystemStatusViewer: Error fetching system stats:', error);
      setStats(prev => ({
        ...prev,
        error: error.message,
        lastUpdated: new Date().toLocaleString()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {

    fetchStats();
  }, []); 



  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        System Status Dashboard - Monitor user accounts and data
      </div>
      
      {stats.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error fetching system status</AlertTitle>
          <AlertDescription>{stats.error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">User Accounts</h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="flex items-center">
                <CircleGauge className="animate-spin h-6 w-6 mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : stats.userCount !== null ? (
              stats.userCount
            ) : (
              <span className="text-sm text-muted-foreground">N/A</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.userCount !== null ? 'Supabase Auth accounts' : 'Requires Edge Function'}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">User Profiles</h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="flex items-center">
                <CircleGauge className="animate-spin h-6 w-6 mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              stats.profileCount !== null ? stats.profileCount : 'Error'
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Database profile records
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Assessment Records</h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="flex items-center">
                <CircleGauge className="animate-spin h-6 w-6 mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              stats.assessmentCount !== null ? stats.assessmentCount : 'Error'
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All assessment records (including incomplete)
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {stats.lastUpdated && `Last updated: ${stats.lastUpdated}`}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchStats}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <CircleGauge className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Stats
            </>
          )}
        </Button>
      </div>
      
      {/* Note about Edge Function limitation */}
      {!isLoading && !stats.error && stats.userCount === null && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Limited Functionality</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Auth user count unavailable - requires working Edge Function to access auth.users table.
            Profile and assessment counts are working normally.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Debug Info */}
      <div className="border-t pt-4 text-xs text-muted-foreground">
        <details>
          <summary className="cursor-pointer hover:text-foreground">Debug Information</summary>
          <div className="mt-2 space-y-1">
            <div>Component state: {isLoading ? 'Loading' : 'Loaded'}</div>
            <div>Error state: {stats.error ? 'Yes' : 'No'}</div>
            <div>Raw stats: {JSON.stringify(stats, null, 2)}</div>
            <div className="mt-2 text-green-600">
              Now using admin-stats function to bypass RLS and see all data in the database.
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SystemStatusViewer;
