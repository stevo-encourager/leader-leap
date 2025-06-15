import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, ArrowRight } from 'lucide-react';
import SectionHeader from './introduction/SectionHeader';

interface AssessmentInstructionsProps {
  onContinue: () => void;
}

const AssessmentInstructions: React.FC<AssessmentInstructionsProps> = ({ onContinue }) => {
  return (
    <div className="fade-in min-h-screen bg-slate-50">
      <main className="assessment-container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CircleCheck className="text-encourager" size={24} /> Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Be honest:</span> This assessment is for your development, so rate your abilities as they truly are, not how you wish they were.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Consider context:</span> When rating "target level," think about what's truly important for your current role or your next step (i.e. a specific role or promotion you are aiming for).
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Take your time:</span> Reflect on each competency carefully. The assessment takes approximately 10-15 minutes to complete.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Focus on development:</span> Remember that the goal is to identify areas for growth, not to achieve a perfect score.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center mt-8">
          <Button onClick={onContinue} size="lg" className="bg-encourager text-white px-8 py-4 text-lg rounded-lg">
            Start Assessment
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AssessmentInstructions; 