
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircleCheck, ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';

const InstructionsSection: React.FC = () => {
  return (
    <Card className="border-none shadow-card bg-white">
      <CardContent className="p-6">
        <SectionHeader icon={CircleCheck} title="Instructions" />
        
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
  );
};

export default InstructionsSection;
