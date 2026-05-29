
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
    <div className={`${isMobile ? 'p-4 pb-8' : 'p-8 pb-12'} flex flex-col items-center`}>
      <a 
        href="https://www.encouragercoaching.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        <img 
          src="/EncouragerLogoNew.png" 
          alt="Encourager Logo" 
          className={`${isMobile ? 'h-20 mb-12' : 'h-28 mb-10'} object-contain`} 
        />
      </a>
      
      <div className="relative mb-4">
        <h1 className={`${isMobile ? 'text-2xl mb-2' : 'heading-1'} text-center`}>
          Discover Your Leadership Gaps
        </h1>
        {isMobile ? (
          /* Mobile version - text below header, no arrow */
          <p 
            className="text-encourager-accent text-center mt-1"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '1.3rem',
              fontWeight: 600
            }}
          >
            ...and do something about it!
          </p>
        ) : (
          /* Desktop version - arrow and text to the right */
          <div className="absolute left-[95%] -top-1">
            <svg 
              width="250" 
              height="120" 
              viewBox="0 0 250 120"
              className="text-encourager-accent overflow-visible"
              style={{ transform: 'rotate(-45deg)', transformOrigin: 'top left' }}
            >
              {/* Curved arrow - shortened by a third */}
              <path
                d="M 5 15 Q 20 0, 45 10 T 70 30"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Arrow head pointing down-left */}
              <path
                d="M 67 26 L 70 30 L 72 25"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Handwritten text - wrapped in group to counter-rotate */}
              <g transform="rotate(45 70 60)">
                <text
                  x="45"
                  y="55"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    fill: 'currentColor'
                  }}
                >
                  and do something
                </text>
                <text
                  x="65"
                  y="73"
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    fill: 'currentColor'
                  }}
                >
                  about it!
                </text>
              </g>
            </svg>
          </div>
        )}
      </div>
      
      <p className={`${isMobile ? 'text-base' : 'text-xl'} text-slate-600 ${isMobile ? 'max-w-full' : 'max-w-2xl'} text-center mb-10`}>
        Your Leadership in the Age of AI: Identify the gaps between where you are and where you need to be. Focus on the human skills that will define tomorrow's leaders.
      </p>
      
      
      <Button 
        size="lg"
        onClick={handleStartClick}
        className="btn-primary w-full md:w-auto px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mt-2"
      >
        START YOUR ASSESSMENT
      </Button>
    </div>
  );
};

export default IntroductionHeader;
