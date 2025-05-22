
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CircleGauge } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const SystemStatusViewer = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{
    userCount: number | null;
    assessmentCount: number | null;
    profileCount: number | null;
    error: string | null;
  }>({
    userCount: null,
    assessmentCount: null,
    profileCount: null,
    error: null
  });
  const { user } = useAuth();

  const fetchStats = async () => {
    setIsLoading(true);
    
    try {
      // Get assessment count
      const { count: assessmentCount, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*', { count: 'exact', head: true });
      
      if (assessmentError) {
        throw new Error(`Error getting assessment count: ${assessmentError.message}`);
      }
      
      // Get profile count
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profileError) {
        throw new Error(`Error getting profile count: ${profileError.message}`);
      }
      
      // Get user count via admin function (requires special permissions)
      const { data: userData, error: userError } = await supabase.functions.invoke('count-users');
      
      if (userError) {
        throw new Error(`Error getting user count: ${userError.message}`);
      }
      
      setStats({
        userCount: userData?.count || 0,
        assessmentCount: assessmentCount || 0,
        profileCount: profileCount || 0,
        error: null
      });
      
    } catch (error: any) {
      console.error('Error fetching system stats:', error);
      setStats({
        ...stats,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []); 

  return (
    <div className="space-y-4">
      {stats.error && (
        <Alert variant="destructive">
          <AlertTitle>Error fetching system status</AlertTitle>
          <AlertDescription>{stats.error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">User Accounts</h3>
          <div className="text-2xl font-bold">
            {isLoading ? <CircleGauge className="animate-spin h-6 w-6" /> : stats.userCount}
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">User Profiles</h3>
          <div className="text-2xl font-bold">
            {isLoading ? <CircleGauge className="animate-spin h-6 w-6" /> : stats.profileCount}
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Assessment Records</h3>
          <div className="text-2xl font-bold">
            {isLoading ? <CircleGauge className="animate-spin h-6 w-6" /> : stats.assessmentCount}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {!isLoading && 
            `Last updated: ${new Date().toLocaleTimeString()}`
          }
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
            'Refresh Stats'
          )}
        </Button>
      </div>
      
      {!isLoading && (stats.userCount || 0) > 0 && (
        <Alert>
          <AlertTitle>System not in clean state</AlertTitle>
          <AlertDescription>
            There are still {stats.userCount} user accounts in the system. 
            Use the App Reset function to completely clear all data.
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoading && (stats.userCount || 0) === 0 && (stats.assessmentCount || 0) === 0 && (stats.profileCount || 0) === 0 && (
        <Alert variant="success" className="bg-green-50 border-green-200">
          <AlertTitle>System in clean state</AlertTitle>
          <AlertDescription>
            All user accounts and data have been successfully deleted. 
            The system is ready for testing from scratch.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SystemStatusViewer;
