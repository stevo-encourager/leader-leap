import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Category } from '../utils/assessmentData';
import IntroductionHeader from './introduction/IntroductionHeader';
import PurposeSection from './introduction/PurposeSection';
import AudienceSection from './introduction/AudienceSection';
import WelcomeSection from './introduction/WelcomeSection';

interface IntroductionPageProps {
  categories: Category[];
  onStartAssessment: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ categories, onStartAssessment }) => {
  return (
    <div className="fade-in space-y-6 pt-0">
      <Card className="border-none overflow-hidden shadow-elevated bg-white">
        <IntroductionHeader onStartAssessment={onStartAssessment} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PurposeSection />
        <AudienceSection />
      </div>

      <WelcomeSection />
    </div>
  );
};

export default IntroductionPage;
