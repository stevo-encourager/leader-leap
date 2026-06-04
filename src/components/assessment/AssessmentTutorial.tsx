import React, { useState, useEffect } from 'react';
import { X, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AssessmentTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentTutorial: React.FC<AssessmentTutorialProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSliderValue, setCurrentSliderValue] = useState(0);
  const [targetSliderValue, setTargetSliderValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = useIsMobile();

  const steps = [
    {
      title: "Rate Your Current Ability",
      description: "Move the first slider to where you believe you are today.\nBe honest with yourself - accurate self-assessment is the foundation of real growth.",
      highlight: "current",
      animation: () => animateSlider('current', 6)
    },
    {
      title: "Set Your Target Level",
      description: "Think strategically but realistically: In **one year's time**, what level would represent meaningful progress? Remember, not every skill needs to be a 10.",
      highlight: "target",
      animation: () => animateSlider('target', 8)
    },
    {
      title: "Your Growth Opportunity",
      description: "The Growth Opportunity Bar visualises your development gap. Combined with all your assessment results, it will help shape your personalised growth plan.",
      highlight: "gap",
      animation: () => {}
    },
    {
      title: "Complete All Skills",
      description: "You must rate both current ability and target level for **EVERY SKILL** before you can advance to the next competency.",
      highlight: "none",
      animation: () => {}
    }
  ];

  useEffect(() => {
    if (isOpen) {
      startTutorial();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentStep < steps.length) {
      const timer = setTimeout(() => {
        steps[currentStep].animation();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const animateSlider = (type: 'current' | 'target', targetValue: number) => {
    setIsAnimating(true);
    let value = 0;
    const totalFrames = 60; // More frames for smoother animation
    const increment = targetValue / totalFrames;
    
    const interval = setInterval(() => {
      value += increment;
      if (value >= targetValue) {
        value = targetValue;
        clearInterval(interval);
        setIsAnimating(false);
      }
      
      if (type === 'current') {
        setCurrentSliderValue(Math.min(targetValue, value));
      } else {
        setTargetSliderValue(Math.min(targetValue, value));
      }
    }, 25); // Faster interval for smoother motion
  };

  const startTutorial = () => {
    setCurrentStep(0);
    setCurrentSliderValue(0);
    setTargetSliderValue(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Reset slider values when going back
      if (currentStep === 1) {
        setCurrentSliderValue(6);
        setTargetSliderValue(0);
      } else if (currentStep === 2) {
        setCurrentSliderValue(6);
        setTargetSliderValue(8);
      } else if (currentStep === 3) {
        setCurrentSliderValue(6);
        setTargetSliderValue(8);
      }
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`bg-white rounded-lg shadow-xl ${isMobile ? 'w-full max-w-sm' : 'max-w-2xl w-full'} relative`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold font-quicksand text-gray-800">
            How to Complete Your Assessment
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-encourager-accent' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            <h4 className="text-3xl font-bold font-quicksand text-encourager-accent mb-4">
              {steps[currentStep].title}
            </h4>
            <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
              {steps[currentStep].description.split('**').map((part, index) => 
                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
              )}
            </p>
          </div>

          {/* Demo Assessment */}
          <div className={`bg-encourager-background-light rounded-lg p-6 ${steps[currentStep].highlight === 'none' && currentStep === 3 ? 'animate-pulse-border' : ''}`}>
            <div className="space-y-6">
              {/* Skill name */}
              <div>
                <h5 className="text-lg font-bold font-quicksand text-gray-800 mb-1">
                  Strategic Thinking
                </h5>
                <p className="text-sm text-gray-600">
                  Ability to see the big picture and plan for the future
                </p>
              </div>

              {/* Current Level */}
              <div className={`space-y-2 ${steps[currentStep].highlight === 'current' ? 'ring-2 ring-encourager-accent rounded-lg p-3 -m-3' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-md font-medium text-gray-700">
                    Current ability:
                  </label>
                  <span className="text-lg font-medium text-encourager">{Math.round(currentSliderValue)}</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-encourager-accent transition-all duration-100"
                      style={{ width: `${(currentSliderValue / 10) * 100}%` }}
                    />
                  </div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-encourager rounded-full shadow-md transition-all duration-100"
                    style={{ left: `calc(${(currentSliderValue / 10) * 100}% - 10px)` }}
                  />
                </div>
              </div>

              {/* Target Level */}
              <div className={`space-y-2 ${steps[currentStep].highlight === 'target' ? 'ring-2 ring-encourager-accent rounded-lg p-3 -m-3' : ''}`}>
                <div className="flex justify-between items-center">
                  <label className="text-md font-medium text-gray-700">
                    Target level:
                  </label>
                  <span className="text-lg font-medium text-encourager">{Math.round(targetSliderValue)}</span>
                </div>
                <div className="relative">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-encourager-accent transition-all duration-100"
                      style={{ width: `${(targetSliderValue / 10) * 100}%` }}
                    />
                  </div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-encourager rounded-full shadow-lg transition-all duration-100"
                    style={{ left: `calc(${(targetSliderValue / 10) * 100}% - 10px)` }}
                  />
                </div>
              </div>

              {/* Gap Visualization */}
              <div className={`${steps[currentStep].highlight === 'gap' ? 'animate-pulse-border rounded-lg p-3 -m-3' : ''}`}>
                <div className="h-1 bg-gray-100 w-full rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-encourager-accent rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(0, (targetSliderValue - currentSliderValue) * 10)}%`,
                      marginLeft: `${currentSliderValue * 10}%`
                    }}
                  />
                </div>
                {(targetSliderValue > currentSliderValue) && (
                  <p className="text-xs text-encourager-accent mt-2 text-center">
                    Growth opportunity: {Math.round(targetSliderValue) - Math.round(currentSliderValue)} points
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-600"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isAnimating}
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isAnimating}
              className="bg-encourager-accent text-white hover:bg-encourager-accent/90"
            >
              {currentStep === steps.length - 1 ? 'Got it!' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentTutorial;