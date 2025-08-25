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
                  <span className="font-medium text-slate-900">Self-assessment: </span>Rate your current skill level from 1-10 and set your desired skill level to work towards. Consider context i.e. think about what's truly important for your current role or your next step. Be realistic about where you need to be.
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-encourager-accent/10 p-2 rounded-full flex-shrink-0">
                  <ArrowRight className="text-encourager" size={16} strokeWidth={1.5} />
                </div>
                <p className="text-slate-700">
                  <span className="font-medium text-slate-900">Complete all ratings: </span>You must select a current and desired rating for every skill before proceeding.
                </p>
              </div>
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
                  <span className="font-medium text-slate-900">Focus on development:</span> Remember that the goal is to identify areas for growth, not to achieve a perfect score.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack} className="w-[120px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={onContinue} 
              className="text-white w-[220px]"
              style={{ backgroundColor: '#5fac9a' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6cbdab'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#5fac9a'}
            >
              Start Assessment
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default AssessmentInstructions; 