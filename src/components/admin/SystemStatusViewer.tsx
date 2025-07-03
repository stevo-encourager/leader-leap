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

  // Fetch system stats (profiles, assessments, user count)
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      setStats(prev => ({ ...prev, error: null }));

      // Get assessment count
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true });

      if (assessmentError) throw new Error(`Error getting assessment count: ${assessmentError.message}`);

      // Get profile count
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (profileError) throw new Error(`Error getting profile count: ${profileError.message}`);

      // Get user count via edge function
      const response = await fetch('/api/list-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch user accounts');
      const userData = await response.json();
      const userCount = userData?.users?.length || 0;

      setStats({
        userCount,
        assessmentCount: assessmentCount || 0,
        profileCount: profileCount || 0,
        error: null,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error: any) {
      setStats(prev => ({
        ...prev,
        error: error.message,
        lastUpdated: new Date().toLocaleString()
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user details via edge function
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const response = await fetch('/api/list-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      if (!data.users) throw new Error('No users returned from edge function');
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

      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" onClick={fetchStats} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
        <Button variant="outline" onClick={handleToggleUsers}>
          {showUsers ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Hide User Accounts
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Show User Accounts
            </>
          )}
        </Button>
      </div>

      {showUsers && (
        <div className="mt-4 border rounded-lg p-4 bg-card">
          <h4 className="font-medium mb-2">User Accounts</h4>
          {isLoadingUsers ? (
            <div className="flex items-center">
              <CircleGauge className="animate-spin h-6 w-6 mr-2" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : usersError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error fetching users</AlertTitle>
              <AlertDescription>{usersError}</AlertDescription>
            </Alert>
          ) : (
            <ul className="list-disc pl-5">
              {users.map((user) => (
                <li key={user.id}>
                  {user.email} {user.role ? `(${user.role})` : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        Last updated: {stats.lastUpdated}
      </div>
    </div>
  );
};

export default SystemStatusViewer;