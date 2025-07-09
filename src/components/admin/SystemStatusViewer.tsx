
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
    console.log("SystemStatusViewer: Starting to fetch stats...");
    
    try {
      // Reset error state
      setStats(prev => ({ ...prev, error: null }));
      
      // Get assessment count - count ALL records, not just completed ones
      console.log("SystemStatusViewer: Fetching assessment count (all records)...");
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true });
      
      if (assessmentError) {
        console.error("SystemStatusViewer: Error getting assessment count:", assessmentError);
        throw new Error(`Error getting assessment count: ${assessmentError.message}`);
      }
      console.log("SystemStatusViewer: Assessment count (all records):", assessmentCount);
      
      // Get profile count - ensure we're counting all profiles
      console.log("SystemStatusViewer: Fetching profile count...");
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profileError) {
        console.error("SystemStatusViewer: Error getting profile count:", profileError);
        throw new Error(`Error getting profile count: ${profileError.message}`);
      }
      console.log("SystemStatusViewer: Profile count:", profileCount);
      
      // Debug: Let's also fetch actual profile data to see what's there
      const { data: profileData, error: profileDataError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');
      
      if (profileDataError) {
        console.error("SystemStatusViewer: Error getting profile data:", profileDataError);
      } else {
        console.log("SystemStatusViewer: Profile data:", profileData);
        console.log("SystemStatusViewer: DETAILED Profile Analysis:");
        profileData?.forEach((profile, index) => {
          console.log(`  Profile ${index + 1}:`, {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at
          });
        });
      }
      
      // Debug: Let's also fetch actual assessment data to see what's there
      const { data: assessmentData, error: assessmentDataError } = await supabase
        .from('assessment_results')
        .select('id, user_id, completed, created_at');
      
      if (assessmentDataError) {
        console.error("SystemStatusViewer: Error getting assessment data:", assessmentDataError);
      } else {
        console.log("SystemStatusViewer: Assessment data:", assessmentData);
        console.log("SystemStatusViewer: Assessment data count:", assessmentData?.length);
        console.log("SystemStatusViewer: Completed assessments:", assessmentData?.filter(a => a.completed !== false).length);
        console.log("SystemStatusViewer: Incomplete assessments:", assessmentData?.filter(a => a.completed === false).length);
        
        console.log("SystemStatusViewer: DETAILED Assessment Analysis:");
        assessmentData?.forEach((assessment, index) => {
          console.log(`  Assessment ${index + 1}:`, {
            id: assessment.id,
            user_id: assessment.user_id,
            completed: assessment.completed,
            created_at: assessment.created_at
          });
        });
        
        // Show unique user IDs in assessments
        const uniqueUserIds = [...new Set(assessmentData?.map(a => a.user_id) || [])];
        console.log("SystemStatusViewer: Unique user IDs in assessments:", uniqueUserIds);
        console.log("SystemStatusViewer: Number of unique users with assessments:", uniqueUserIds.length);
      }
      
      // Get user count via admin function
      console.log("SystemStatusViewer: Fetching user count via edge function...");
      const { data: userData, error: userError } = await supabase.functions.invoke('count-users');
      
      if (userError) {
        console.error("SystemStatusViewer: Error getting user count:", userError);
        throw new Error(`Error getting user count: ${userError.message}`);
      }
      console.log("SystemStatusViewer: User count response:", userData);
      
      // Let's also get detailed user information to see what users exist
      console.log("SystemStatusViewer: Fetching detailed user list...");
      const { data: userListData, error: userListError } = await supabase.functions.invoke('list-users');
      
      if (userListError) {
        console.error("SystemStatusViewer: Error getting user list:", userListError);
      } else {
        console.log("SystemStatusViewer: User list response:", userListData);
        if (userListData?.users) {
          console.log("SystemStatusViewer: DETAILED User Analysis:");
          userListData.users.forEach((user: any, index: number) => {
            console.log(`  User ${index + 1}:`, {
              id: user.id,
              email: user.email,
              created_at: user.created_at,
              email_confirmed_at: user.email_confirmed_at,
              last_sign_in_at: user.last_sign_in_at
            });
          });
          
          // Cross-reference users with profiles
          const userIds = userListData.users.map((u: any) => u.id);
          const profileUserIds = profileData?.map(p => p.id) || [];
          const usersWithoutProfiles = userIds.filter((uid: string) => !profileUserIds.includes(uid));
          
          console.log("SystemStatusViewer: PROFILE SYNC ANALYSIS:");
          console.log("  All user IDs:", userIds);
          console.log("  Profile user IDs:", profileUserIds);
          console.log("  Users WITHOUT profiles:", usersWithoutProfiles);
          console.log("  Number of users missing profiles:", usersWithoutProfiles.length);
        }
      }
      
      const userCount = userData?.count || 0;
      const timestamp = new Date().toLocaleString();
      
      setStats({
        userCount,
        assessmentCount: assessmentCount || 0,
        profileCount: profileCount || 0,
        error: null,
        lastUpdated: timestamp
      });
      
      console.log("SystemStatusViewer: Stats updated successfully:", {
        userCount,
        assessmentCount,
        profileCount,
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
      
      {/* System Status Alerts */}
      {!isLoading && !stats.error && (
        <>
          {/* Profile mismatch warning */}
          {stats.userCount && stats.profileCount && stats.userCount !== stats.profileCount && (
            <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Profile Sync Issue</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                User accounts ({stats.userCount}) and profiles ({stats.profileCount}) don't match. 
                Some users may not have profiles created automatically.
                Check console logs for detailed analysis of which users are missing profiles.
              </AlertDescription>
            </Alert>
          )}
          
          {(stats.userCount || 0) > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>System not in clean state</AlertTitle>
              <AlertDescription>
                There are still {stats.userCount} user accounts in the system. 
                Use the App Reset function to completely clear all data.
              </AlertDescription>
            </Alert>
          )}
          
          {(stats.userCount || 0) === 0 && (stats.assessmentCount || 0) === 0 && (stats.profileCount || 0) === 0 && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">System in clean state</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                All user accounts and data have been successfully deleted. 
                The system is ready for testing from scratch.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      
      {/* Debug Info */}
      <div className="border-t pt-4 text-xs text-muted-foreground">
        <details>
          <summary className="cursor-pointer hover:text-foreground">Debug Information</summary>
          <div className="mt-2 space-y-1">
            <div>Component state: {isLoading ? 'Loading' : 'Loaded'}</div>
            <div>Error state: {stats.error ? 'Yes' : 'No'}</div>
            <div>Raw stats: {JSON.stringify(stats, null, 2)}</div>
            <div className="mt-2 text-amber-600">
              Note: Check browser console for detailed debug logs about profile and assessment data.
            </div>
            <div className="mt-2 text-blue-600">
              Expanded Analysis: Console now shows detailed user, profile, and assessment cross-references to identify missing data.
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SystemStatusViewer;
