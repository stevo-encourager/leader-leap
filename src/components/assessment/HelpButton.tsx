
import React, { useState } from 'react';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AssessmentTutorial from './AssessmentTutorial';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleButtonClick = () => {
    setIsOpen(true);
  };

  const handleShowTutorial = () => {
    setIsOpen(false);
    setShowTutorial(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="flex items-center gap-2 z-10"
        style={{ minWidth: '80px' }}
      >
        <HelpCircle size={16} />
        Help
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to Use the Assessment</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <div className="bg-encourager-accent/10 border border-encourager-accent/20 rounded-lg p-3 mb-3">
                <Button
                  onClick={handleShowTutorial}
                  className="w-full bg-encourager-accent text-white hover:bg-encourager-accent/90 flex items-center justify-center gap-2"
                >
                  <PlayCircle size={20} />
                  Watch Quick Tutorial
                </Button>
              </div>
              <div>
                <strong>Current ability:</strong> Rate where you are today (1-10)
              </div>
              <div>
                <strong>Target level:</strong> Think strategically about what level your role actually needs. Not every skill needs to be at expert level!
              </div>
              <div className="text-sm text-gray-600">
                Consider:
                <ul className="ml-4 mt-1">
                  <li>• What does your current role require?</li>
                  <li>• Which skills are most critical for your goals?</li>
                  <li>• Where would improvement have the most impact?</li>
                </ul>
              </div>
              <div className="text-sm italic text-gray-500">
                You must select a rating for every skill before proceeding.
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <AssessmentTutorial 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
};

export default HelpButton;
