
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface IntroductionHeaderProps {
  onStartAssessment: () => void;
}

const IntroductionHeader: React.FC<IntroductionHeaderProps> = ({ onStartAssessment }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Call the provided function
    onStartAssessment();
    
    // Explicitly navigate to ensure it works
    navigate('/assessment');
  };
  
  return (
    <div className="p-8 flex flex-col items-center">
      <img 
        src="/lovable-uploads/8320d514-fba5-4e1b-a658-1563758db943.png" 
        alt="Encourager Logo" 
        className="h-32 object-contain mb-6 animate-float" 
      />
      
      <h1 className="text-4xl md:text-5xl font-bold text-encourager mb-4 text-center">
        Leadership Gap Assessment Tool
      </h1>
      
      <p className="text-xl text-slate-600 max-w-2xl text-center mb-10">
        Identify gaps between your current leadership competencies and where you want to be.
      </p>
      
      <Button 
        size="lg"
        onClick={handleClick}
        className="bg-encourager hover:bg-encourager-light text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
      >
        Start Your Assessment
      </Button>
    </div>
  );
};

export default IntroductionHeader;
