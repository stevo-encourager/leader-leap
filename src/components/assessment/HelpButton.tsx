
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const HelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <HelpCircle size={16} />
        Help
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to Use the Assessment</DialogTitle>
            <DialogDescription className="text-left space-y-3 pt-2">
              <p>
                For each competency, use the sliders to rate your current ability and your target level.
              </p>
              <p>
                Move the dot along the scale to choose your rating. You must select a rating for every skill before proceeding.
              </p>
              <p>
                For Target level, consider context i.e. think about what's truly important for your current role or your next step (a specific role or promotion you are aiming for).
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpButton;
