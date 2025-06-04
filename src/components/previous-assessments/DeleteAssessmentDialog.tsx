
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Shield } from 'lucide-react';

interface DeleteAssessmentDialogProps {
  onDeleteAssessment: (assessmentId: string) => Promise<void>;
  assessmentId: string;
  isDeleting?: boolean;
}

const DeleteAssessmentDialog = ({ 
  onDeleteAssessment, 
  assessmentId, 
  isDeleting = false 
}: DeleteAssessmentDialogProps) => {
  // Protected test assessment ID
  const TEST_ASSESSMENT_ID = 'f74470bc-3c48-4980-bc5f-17386a724d37';
  const isTestAssessment = assessmentId === TEST_ASSESSMENT_ID;

  const handleDelete = () => {
    if (!isTestAssessment) {
      onDeleteAssessment(assessmentId);
    }
  };

  // If this is the test assessment, show a protected button instead
  if (isTestAssessment) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="text-slate-400 border-slate-200 cursor-not-allowed"
        disabled={true}
        title="This test assessment is protected and cannot be deleted"
      >
        <Shield className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this assessment? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAssessmentDialog;
