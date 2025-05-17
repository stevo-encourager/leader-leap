
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import { BookOpen, Users, Presentation, User } from 'lucide-react';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to the Leadership Assessment</CardTitle>
          <CardDescription>
            This assessment will help you identify gaps between your current leadership skills and where you want to be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <BookOpen className="text-primary" />
                Purpose of the Assessment
              </h3>
              <p className="text-slate-700">
                This leadership assessment tool is designed to help you identify the gaps between your current 
                leadership abilities and where you aspire to be. By understanding these gaps, you can create 
                focused development plans that target your specific growth areas.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Users className="text-primary" />
                Benefits
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Self-awareness</strong> - Gain a clear understanding of your leadership strengths and areas for development</li>
                <li><strong>Targeted development</strong> - Focus your growth efforts on the skills with the greatest gaps</li>
                <li><strong>Progress tracking</strong> - Establish a baseline to measure your growth over time</li>
                <li><strong>Career advancement</strong> - Develop the leadership skills required for your next career move</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <Presentation className="text-primary" />
                Assessment Areas
              </h3>
              <p className="text-slate-700 mb-4">This assessment covers ten key areas of leadership:</p>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-md p-4">
                    <h4 className="font-medium mb-1">{category.title}</h4>
                    <p className="text-sm text-slate-600">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                <User className="text-primary" />
                How to Complete the Assessment
              </h3>
              <p className="text-slate-700 mb-2">For each skill, you will rate:</p>
              <div className="pl-5 space-y-2">
                <p><strong>Current ability:</strong> Your current proficiency in this skill (1-10)</p>
                <p><strong>Importance to your role:</strong> The level of importance this skill has to your role (1-10)</p>
              </div>
              <p className="mt-3 text-slate-700">The difference between these ratings represents your skill gap and potential development area.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" onClick={onStartAssessment}>
            Start Assessment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntroductionPage;
