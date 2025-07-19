
import React from 'react';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataSchemaViewer from '@/components/admin/DataSchemaViewer';
import SystemStatusViewer from '@/components/admin/SystemStatusViewer';
import UserManagement from '@/components/admin/UserManagement';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {

  
  return (
    <>
      <SEO title="Admin - Leader Leap" description="Admin dashboard (private)" ogType="website" canonical="https://leader-leap.com/admin" structuredData={{}} additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
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
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="schema">Data Schema</TabsTrigger>
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
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="schema" className="mt-6">
            <DataSchemaViewer />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
