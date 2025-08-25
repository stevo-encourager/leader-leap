
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Gift } from 'lucide-react';

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
          className={`${isMobile ? 'h-24' : 'h-32'} object-contain mb-6`} 
        />
      </a>
      
      <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-encourager mb-4 text-center`}>
        Leader Leap Assessment Tool
      </h1>
      
      <p className={`${isMobile ? 'text-base' : 'text-xl'} text-slate-600 ${isMobile ? 'max-w-full' : 'max-w-2xl'} text-center mb-8`}>
        Identify and close the gaps between your current leadership competencies and where you want to be.
      </p>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <Gift size={isMobile ? 14 : 16} style={{ color: '#5fac9a' }} />
        <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`} style={{ color: '#5fac9a' }}>
          Currently free
        </span>
      </div>
      
      <Button 
        size="lg"
        onClick={handleStartClick}
        className="text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 font-medium"
        style={{ backgroundColor: '#2F564D' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#3a6b61'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2F564D'}
      >
        Start Your Assessment
      </Button>
    </div>
  );
};

export default IntroductionHeader;
