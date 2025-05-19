
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gauge, CheckCircle2 } from 'lucide-react';

interface MidpointProgressMessageProps {
  onClose: () => void;
}

const MidpointProgressMessage: React.FC<MidpointProgressMessageProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/10 transition-all"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator */}
        <div className="bg-encourager h-1.5 w-1/2"></div>
        
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-encourager-lightgray flex items-center justify-center text-encourager">
              <Gauge className="h-8 w-8" />
            </div>
          </div>
          
          <h3 className="text-2xl font-playfair font-semibold text-center text-encourager-gray mb-2">
            Halfway There!
          </h3>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-1 text-encourager font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>50% Complete</span>
            </div>
            <p className="mt-3 text-encourager-gray">
              You're making excellent progress on your assessment. Keep providing thoughtful responses to ensure you get the most accurate results.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={onClose}
              className="bg-encourager hover:bg-encourager-light w-full"
            >
              Continue Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidpointProgressMessage;
