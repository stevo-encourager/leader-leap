
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface IntroductionHeaderProps {
  onStartAssessment?: () => void;
}

const IntroductionHeader: React.FC<IntroductionHeaderProps> = ({ onStartAssessment }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleStartClick = () => {
    if (onStartAssessment) {
      onStartAssessment();
    } else {
      navigate('/assessment');
    }
  };
  
  return (
    <div className={`${isMobile ? 'p-4' : 'p-8'} flex flex-col items-center`}>
      <a 
        href="https://www.encouragercoaching.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        <img 
          src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
          alt="Encourager Logo" 
          className={`${isMobile ? 'h-24' : 'h-32'} object-contain mb-6 animate-float`} 
        />
      </a>
      
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-encourager mb-4 text-center`}>
        Leader Leap Assessment Tool
      </h1>
      
      <p className={`${isMobile ? 'text-base' : 'text-xl'} text-slate-600 ${isMobile ? 'max-w-full' : 'max-w-2xl'} text-center mb-10`}>
        Identify and close the gaps between your current leadership competencies and where you want to be.
      </p>
      
      <Button 
        size="lg"
        onClick={handleStartClick}
        className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
      >
        Start Your Assessment
      </Button>
    </div>
  );
};

export default IntroductionHeader;
