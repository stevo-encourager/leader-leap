
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface DeleteAllAssessmentsDialogProps {
  isDeleting: boolean;
  onDeleteAll: () => Promise<void>;
}

const DeleteAllAssessmentsDialog = ({ isDeleting, onDeleteAll }: DeleteAllAssessmentsDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={isDeleting}
          className="flex items-center gap-2"
        >
          <Trash2 size={16} />
          <span>{isDeleting ? "Deleting..." : "Delete All"}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete all assessments</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All your completed assessment data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDeleteAll}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAllAssessmentsDialog;
