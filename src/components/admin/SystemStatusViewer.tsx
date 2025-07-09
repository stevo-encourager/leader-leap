
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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
    console.log("SystemStatusViewer: Starting to fetch stats using admin-stats function...");
    
    try {
      // Reset error state
      setStats(prev => ({ ...prev, error: null }));
      
      // Use the new admin-stats function that bypasses RLS
      console.log("SystemStatusViewer: Fetching all stats via admin-stats function...");
      const { data: statsData, error: statsError } = await supabase.functions.invoke('admin-stats');
      
      if (statsError) {
        console.error("SystemStatusViewer: Error getting admin stats:", statsError);
        throw new Error(`Error getting admin stats: ${statsError.message}`);
      }
      
      console.log("SystemStatusViewer: Admin stats response:", statsData);
      
      if (!statsData.success) {
        throw new Error(statsData.error || "Failed to get admin stats");
      }
      
      const timestamp = new Date().toLocaleString();
      
      setStats({
        userCount: statsData.userCount || 0,
        assessmentCount: statsData.assessmentCount || 0,
        profileCount: statsData.profileCount || 0,
        error: null,
        lastUpdated: timestamp
      });
      
      console.log("SystemStatusViewer: Stats updated successfully:", {
        userCount: statsData.userCount,
        assessmentCount: statsData.assessmentCount,
        profileCount: statsData.profileCount,
        timestamp
      });
      
    } catch (error: any) {
      console.error('SystemStatusViewer: Error fetching system stats:', error);
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
    console.log("SystemStatusViewer: Component mounted, fetching initial stats...");
    fetchStats();
  }, []); 

  console.log("SystemStatusViewer: Rendering with stats:", stats, "isLoading:", isLoading);

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
            ) : (
              stats.userCount !== null ? stats.userCount : 'Error'
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Supabase Auth accounts
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
      
      {/* Profile mismatch warning - only show if there's actually a mismatch */}
      {!isLoading && !stats.error && stats.userCount && stats.profileCount && stats.userCount !== stats.profileCount && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 dark:text-amber-200">Profile Sync Issue</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            User accounts ({stats.userCount}) and profiles ({stats.profileCount}) don't match. 
            Some users may not have profiles created automatically.
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
