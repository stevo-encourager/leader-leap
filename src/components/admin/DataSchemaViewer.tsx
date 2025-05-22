
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DataSchemaViewer = () => {
  // Sample data structures for visualization
  const localStorageSchema = {
    assessment_categories: "Category[]",
    assessment_demographics: "Demographics",
    assessment_timestamp: "ISO date string"
  };
  
  const dbSchema = {
    assessment_results: {
      id: "UUID",
      user_id: "UUID (references auth.users)",
      categories: "JSONB (Category[])",
      demographics: "JSONB (Demographics)",
      created_at: "timestamp with time zone",
      completed: "boolean"
    }
  };

  const typeSchema = {
    Category: {
      id: "string",
      title: "string",
      description: "string",
      skills: "Skill[]"
    },
    Skill: {
      id: "string",
      name: "string",
      description: "string",
      ratings: "SkillRating"
    },
    SkillRating: {
      current: "number",
      desired: "number"
    },
    Demographics: {
      role: "string (optional)",
      yearsOfExperience: "string (optional)",
      industry: "string (optional)"
    }
  };

  const sampleData = {
    categories: [
      {
        id: "category-123",
        title: "Leadership",
        description: "Leadership skills assessment",
        skills: [
          {
            id: "skill-456",
            name: "Strategic Thinking",
            description: "Ability to develop long-term plans",
            ratings: {
              current: 3,
              desired: 5
            }
          }
        ]
      }
    ],
    demographics: {
      role: "Manager",
      yearsOfExperience: "5-10",
      industry: "Technology"
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment Data Schema</CardTitle>
        <CardDescription>
          Data structures used throughout the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="types">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="types">TypeScript Types</TabsTrigger>
            <TabsTrigger value="localstorage">Local Storage</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="sample">Sample Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="types" className="space-y-4">
            <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(typeSchema, null, 2)}
            </pre>
          </TabsContent>
          
          <TabsContent value="localstorage" className="space-y-4">
            <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(localStorageSchema, null, 2)}
            </pre>
          </TabsContent>
          
          <TabsContent value="database" className="space-y-4">
            <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(dbSchema, null, 2)}
            </pre>
          </TabsContent>
          
          <TabsContent value="sample" className="space-y-4">
            <pre className="bg-slate-50 p-4 rounded-md overflow-auto text-sm max-h-96">
              {JSON.stringify(sampleData, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataSchemaViewer;
