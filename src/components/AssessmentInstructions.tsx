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
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-encourager-accent/10 p-3 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager-accent" size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-quicksand text-encourager-accent mb-2">Be ruthlessly honest:</h3>
                  <p className="text-base text-slate-800 leading-relaxed">Rate where you are today and where you need to be (1-10, from Beginner to Expert).</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-encourager-accent/10 p-3 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager-accent" size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-quicksand text-encourager-accent mb-2">Think strategically:</h3>
                  <p className="text-base text-slate-800 leading-relaxed">What leadership skills will set you apart in an AI-enhanced world?</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-encourager-accent/10 p-3 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager-accent" size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-quicksand text-encourager-accent mb-2">Set realistic targets:</h3>
                  <p className="text-base text-slate-800 leading-relaxed">Think about where you want to be in <strong>one year's time</strong>.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-encourager-accent/10 p-3 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager-accent" size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-quicksand text-encourager-accent mb-2">Complete everything:</h3>
                  <p className="text-base text-slate-800 leading-relaxed">Every skill counts. Rate all to continue.</p>
                </div>
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