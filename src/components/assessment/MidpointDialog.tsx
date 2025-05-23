
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay
} from "@/components/ui/dialog";
import { Gauge, CheckCircle2 } from 'lucide-react';

interface MidpointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MidpointDialog: React.FC<MidpointDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="backdrop-blur-md bg-black/30" />
      <DialogContent className="max-w-md">
        <div className="bg-encourager h-1.5 w-1/2 absolute top-0 left-0"></div>
        
        <DialogHeader className="pt-4 items-center">
          <div className="h-16 w-16 rounded-full bg-encourager-lightgray flex items-center justify-center text-encourager mb-4">
            <Gauge className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-playfair font-semibold text-center text-encourager-gray">
            Halfway There!
          </DialogTitle>
          <DialogDescription className="text-center">
            <div className="flex items-center justify-center gap-1 text-encourager font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>50% Complete</span>
            </div>
            <p className="mt-3 text-encourager-gray">
              You're making excellent progress on your assessment. Keep providing thoughtful responses to ensure you get the most accurate results.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-encourager hover:bg-encourager-light w-full"
          >
            Continue Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MidpointDialog;
