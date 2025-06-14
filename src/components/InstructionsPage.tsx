
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import InstructionsSection from './introduction/InstructionsSection';

interface InstructionsPageProps {
  onContinue: () => void;
  onBack: () => void;
}

const InstructionsPage: React.FC<InstructionsPageProps> = ({ onContinue, onBack }) => {
  return (
    <div className="fade-in space-y-6 pt-0">
      <Card className="border-none shadow-card bg-white">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-encourager mb-4">
              Assessment Instructions
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Please read these instructions carefully before starting your assessment.
            </p>
          </div>
        </CardContent>
      </Card>

      <InstructionsSection />

      <CardFooter className="flex justify-between pt-4 pb-8">
        <Button 
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to About You
        </Button>
        
        <Button 
          size="lg"
          onClick={onContinue}
          className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
        >
          Continue to Assessment
        </Button>
      </CardFooter>
    </div>
  );
};

export default InstructionsPage;
