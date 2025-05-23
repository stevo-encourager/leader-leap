
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResetAppButton from '@/components/admin/ResetAppButton';
import DataSchemaViewer from '@/components/admin/DataSchemaViewer';
import SystemStatusViewer from '@/components/admin/SystemStatusViewer';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  console.log("Admin page: Rendering admin dashboard");
  console.log("Admin page: SystemStatusViewer component imported:", !!SystemStatusViewer);
  console.log("Admin page: Current URL:", window.location.href);
  
  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="schema">Data Schema</TabsTrigger>
          <TabsTrigger value="reset">App Reset</TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                View current system statistics and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatusViewer />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schema" className="mt-6">
          <DataSchemaViewer />
        </TabsContent>
        
        <TabsContent value="reset" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Reset Application</CardTitle>
              <CardDescription>
                Permanently delete all user accounts and application data for testing purposes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This will delete all user accounts, assessment data, and clear local storage.
                This action cannot be undone and is intended for testing environments only.
              </p>
              <div className="border border-destructive/20 bg-destructive/5 rounded-md p-4">
                <h3 className="font-medium mb-2">This will delete:</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>All user accounts in the Supabase Auth system</li>
                  <li>All profiles records in the database</li>
                  <li>All assessment_results records in the database</li>
                  <li>All browser local storage data</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <ResetAppButton />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
