import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    console.log("SystemStatusViewer: Starting to fetch stats...");
    
    try {
      // Reset error state
      setStats(prev => ({ ...prev, error: null }));
      
      // Get assessment count
      console.log("SystemStatusViewer: Fetching assessment count...");
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true });
      
      if (assessmentError) {
        console.error("SystemStatusViewer: Error getting assessment count:", assessmentError);
        throw new Error(`Error getting assessment count: ${assessmentError.message}`);
      }
      console.log("SystemStatusViewer: Assessment count:", assessmentCount);
      
      // Get profile count
      console.log("SystemStatusViewer: Fetching profile count...");
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profileError) {
        console.error("SystemStatusViewer: Error getting profile count:", profileError);
        throw new Error(`Error getting profile count: ${profileError.message}`);
      }
      console.log("SystemStatusViewer: Profile count:", profileCount);
      
      // Get user count via admin function
      console.log("SystemStatusViewer: Fetching user count via edge function...");
      const { data: userData, error: userError } = await supabase.functions.invoke('count-users');
      
      if (userError) {
        console.error("SystemStatusViewer: Error getting user count:", userError);
        throw new Error(`Error getting user count: ${userError.message}`);
      }
      console.log("SystemStatusViewer: User count response:", userData);
      
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

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      // Call the new edge function to get user details
      const { data, error } = await supabase.functions.invoke('list-users');
      if (error || !data || !data.users) {
        throw new Error(error?.message || 'Failed to fetch users');
      }
      setUsers(data.users);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleToggleUsers = () => {
    if (!showUsers && users.length === 0) {
      fetchUsers();
    }
    setShowUsers((prev) => !prev);
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
            Completed assessments
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {stats.lastUpdated && `Last updated: ${stats.lastUpdated}`}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleUsers}
            disabled={isLoading}
            aria-expanded={showUsers}
            aria-controls="user-list-section"
          >
            {showUsers ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showUsers ? 'Hide User Accounts' : 'Show User Accounts'}
          </Button>
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
      </div>
      
      {showUsers && (
        <div id="user-list-section" className="mt-4 border rounded-md p-4 bg-slate-50">
          <h3 className="font-medium mb-2">User Accounts ({users.length})</h3>
          {isLoadingUsers ? (
            <div className="flex items-center text-sm"><CircleGauge className="animate-spin h-4 w-4 mr-2" /> Loading users...</div>
          ) : usersError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error loading users</AlertTitle>
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          ) : users.length === 0 ? (
            <div className="text-muted-foreground text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Email</th>
                    <th className="px-2 py-1 border">Created At</th>
                    <th className="px-2 py-1 border">Last Sign In</th>
                    <th className="px-2 py-1 border">Role</th>
                    <th className="px-2 py-1 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-2 py-1 border font-mono">{user.id}</td>
                      <td className="px-2 py-1 border">{user.email}</td>
                      <td className="px-2 py-1 border">{user.created_at}</td>
                      <td className="px-2 py-1 border">{user.last_sign_in_at || '-'}</td>
                      <td className="px-2 py-1 border">{user.role || '-'}</td>
                      <td className="px-2 py-1 border">{user.aud || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* System Status Alerts */}
      {!isLoading && !stats.error && (
        <>
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
          </div>
        </details>
      </div>
    </div>
  );
};

export default SystemStatusViewer;
