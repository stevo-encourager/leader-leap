import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import SectionHeader from './introduction/SectionHeader';

interface AssessmentInstructionsProps {
  onContinue: () => void;
  onBack: () => void;
}

const AssessmentInstructions: React.FC<AssessmentInstructionsProps> = ({ onContinue, onBack }) => {
  return (
    <div className="fade-in min-h-screen bg-encourager-background">
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
                  <span className="font-medium text-slate-900">Be ruthlessly honest:</span> Rate where you are today and where you need to be (1-10, from Beginner to Expert).
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Think strategically:</span> What human skills will set you apart in an AI-enhanced world?
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Set realistic targets:</span> Think about where you want to be in one year's time.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Complete everything:</span> Every human skill counts. Rate all to continue.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 relative">
            <Button variant="outline" onClick={onBack} className="absolute left-6 top-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex justify-center w-full pt-6">
              <Button 
                onClick={onContinue} 
                className="btn-primary"
              >
                START ASSESSMENT
              </Button>
            </div>
            <p className="text-sm text-encourager-accent text-center w-full mb-2">Time to complete: approximately 10 minutes</p>
            <p className="text-sm text-slate-600 font-medium text-center w-full pt-4">By the way, this is FREE. No catch at the end!</p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AssessmentInstructions; 