
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import IntroductionHeader from './introduction/IntroductionHeader';
import PurposeSection from './introduction/PurposeSection';
import AudienceSection from './introduction/AudienceSection';
import InstructionsSection from './introduction/InstructionsSection';
import BenefitsSection from './introduction/BenefitsSection';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  const handleStartAssessment = () => {
    // Call the provided function to set up state
    onStartAssessment();
    
    // Force navigation using direct DOM API
    document.location.href = '/assessment';
  };

  return (
    <div className="fade-in space-y-6 pt-0">
      <Card className="border-none overflow-hidden shadow-elevated bg-white">
        <IntroductionHeader onStartAssessment={handleStartAssessment} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PurposeSection />
        <AudienceSection />
      </div>

      <InstructionsSection />
      <BenefitsSection />

      <CardFooter className="flex justify-center pt-4 pb-8">
        <Button 
          size="lg"
          onClick={handleStartAssessment}
          className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
        >
          Start Your Assessment
        </Button>
      </CardFooter>
    </div>
  );
};

export default IntroductionPage;
