
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CircleGauge, AlertTriangle } from 'lucide-react';
import { resetAppData } from '@/services/resetApp';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const ResetAppButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  
  const handleResetApp = async () => {
    setIsResetting(true);
    setProgress(10); // Started
    
    try {
      // Clear local storage first
      setProgress(30); // Local storage clear
      
      // Delete data and users
      const result = await resetAppData();
      setProgress(90); // Almost done
      
      if (result.success) {
        // Force navigation to home page after successful reset
        toast({
          title: "Reset complete",
          description: result.warning || "Application has been reset. All users and data have been removed.",
          variant: result.warning ? "destructive" : "default",
        });
        
        setProgress(100); // Complete
        
        // Small delay to ensure toast is shown before redirect
        setTimeout(() => {
          navigate('/');
          // Force reload to clear any in-memory state
          window.location.reload();
        }, 1500);
      } else {
        setProgress(0); // Reset progress on error
      }
    } catch (error) {
      console.error("Error resetting app:", error);
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred while resetting the application.",
        variant: "destructive",
      });
      setProgress(0); // Reset progress
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <AlertTriangle size={16} />
          Reset Application Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">⚠️ Delete ALL Application Data</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-bold">This action cannot be undone!</p>
            <p>This will permanently delete:</p>
            <ul className="list-disc pl-6">
              <li>All user accounts</li>
              <li>All assessment records</li>
              <li>Local storage data</li>
            </ul>
            <p>Are you absolutely sure you want to proceed?</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isResetting && (
          <div className="space-y-2 py-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              {progress < 30 && "Starting reset process..."}
              {progress >= 30 && progress < 60 && "Deleting local data..."}
              {progress >= 60 && progress < 90 && "Deleting users and database records..."}
              {progress >= 90 && "Finalizing reset..."}
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleResetApp} 
            disabled={isResetting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isResetting ? (
              <>
                <CircleGauge className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Yes, Reset Everything"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetAppButton;
