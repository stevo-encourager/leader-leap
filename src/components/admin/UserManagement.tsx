
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  full_name?: string;
  receive_emails?: boolean;
  gdpr_consent?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    console.log("UserManagement: Fetching all users via list-users function...");
    
    try {
      // Use the list-users function to get all users
      const { data: usersData, error: usersError } = await supabase.functions.invoke('list-users');
      
      if (usersError) {
        console.error("UserManagement: Error getting users:", usersError);
        throw new Error(`Error getting users: ${usersError.message}`);
      }
      
      console.log("UserManagement: Users response:", usersData);
      
      if (!usersData.success) {
        throw new Error(usersData.error || "Failed to get users");
      }
      
      // Get profile data for additional user information using the new edge function
      const { data: profilesData, error: profilesError } = await supabase.functions.invoke('list-profiles');
      
      if (profilesError) {
        console.warn("UserManagement: Error getting profiles via edge function:", profilesError);
      }
      
      const profiles = profilesData?.profiles || [];
      console.log("UserManagement: Profiles data from edge function:", profiles);
      
      // Merge user data with profile data
      const mergedUsers = usersData.users.map((user: any) => {
        const profile = profiles.find((p: any) => p.id === user.id);
        console.log(`UserManagement: Merging user ${user.email} with profile:`, profile);
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          full_name: profile?.full_name || user.user_metadata?.full_name,
          receive_emails: profile?.receive_emails,
          gdpr_consent: profile?.gdpr_consent
        };
      });
      
      setUsers(mergedUsers);
      setLastUpdated(new Date().toLocaleString());
      
      console.log("UserManagement: Users loaded successfully:", mergedUsers.length, "users");
      console.log("UserManagement: Final merged user data:", mergedUsers);
      
    } catch (error: any) {
      console.error('UserManagement: Error fetching users:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserManagement: Component mounted, fetching users...");
    fetchUsers();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const isAdmin = (email: string) => {
    const superAdmins = ['steve@encourager.co.uk'];
    return superAdmins.some(adminEmail => 
      adminEmail.toLowerCase() === email.toLowerCase().trim()
    );
  };

  const formatEmailPreference = (receiveEmails: boolean | string | number | undefined | null) => {
    if (receiveEmails === true || receiveEmails === "true" || receiveEmails === 1) {
      return <span className="text-green-600">Subscribed</span>;
    } else if (receiveEmails === false || receiveEmails === "false" || receiveEmails === 0) {
      return <span className="text-gray-600">Unsubscribed</span>;
    } else {
      return <span className="text-gray-400">Unknown</span>;
    }
  };

  const formatGDPRConsent = (gdprConsent: boolean | undefined | null) => {
    if (gdprConsent === true) {
      return <span className="text-green-600">Consented</span>;
    } else if (gdprConsent === false) {
      return <span className="text-red-600">Declined</span>;
    } else {
      return <span className="text-gray-400">Unknown</span>;
    }
  };

  console.log("UserManagement: Rendering with users:", users.length, "isLoading:", isLoading);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          View all registered users and their details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading users</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {lastUpdated && `Last updated: ${lastUpdated}`}
            {users.length > 0 && ` • ${users.length} users total`}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Email Prefs</TableHead>
                  <TableHead>GDPR Consent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.full_name || '-'}
                    </TableCell>
                    <TableCell>
                      {isAdmin(user.email) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          User
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.email_confirmed_at ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.last_sign_in_at)}
                    </TableCell>
                    <TableCell>
                      {formatEmailPreference(user.receive_emails)}
                    </TableCell>
                    <TableCell>
                      {formatGDPRConsent(user.gdpr_consent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Summary */}
        {users.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="font-medium">{users.length}</div>
                <div className="text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="font-medium">
                  {users.filter(u => isAdmin(u.email)).length}
                </div>
                <div className="text-muted-foreground">Admin Users</div>
              </div>
              <div>
                <div className="font-medium">
                  {users.filter(u => u.email_confirmed_at).length}
                </div>
                <div className="text-muted-foreground">Verified Emails</div>
              </div>
              <div>
                <div className="font-medium">
                  {users.filter(u => u.receive_emails == true).length}
                </div>
                <div className="text-muted-foreground">Email Subscribers</div>
              </div>
              <div>
                <div className="font-medium">
                  {users.filter(u => u.gdpr_consent == true).length}
                </div>
                <div className="text-muted-foreground">GDPR Consented</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserManagement;
