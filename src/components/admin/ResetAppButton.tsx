
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CircleGauge, AlertTriangle } from 'lucide-react';
import { resetAppData } from '@/services/resetApp';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ResetAppButton = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [resetResults, setResetResults] = useState<any>(null);
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
      
      // Store results for display
      setResetResults(result);
      
      if (result.success) {
        // Show success toast 
        toast({
          title: "Reset complete",
          description: result.warning || "Application has been reset. All users and data have been removed.",
          variant: result.warning ? "destructive" : "default",
        });
        
        setProgress(100); // Complete
        
        // Show detailed results dialog
        setShowResults(true);
        
        // Small delay to ensure toast is shown before redirect
        setTimeout(() => {
          navigate('/');
          // Force reload to clear any in-memory state
          window.location.reload();
        }, 5000); // Give more time to see the results
      } else {
        setProgress(0); // Reset progress on error
        setShowResults(true); // Still show results dialog with error details
      }
    } catch (error) {
      console.error("Error resetting app:", error);
      toast({
        title: "Reset failed",
        description: "An unexpected error occurred while resetting the application.",
        variant: "destructive",
      });
      setProgress(0); // Reset progress
      setResetResults({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
      setShowResults(true);
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <>
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
      
      {/* Detailed Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className={resetResults?.success ? "text-green-600" : "text-destructive"}>
              {resetResults?.success ? "Reset Complete" : "Reset Failed"}
            </DialogTitle>
            <DialogDescription>
              {resetResults?.success 
                ? "The application has been reset. Redirecting to home page..."
                : "There were issues during the reset process. Please review the details below:"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {resetResults?.warning && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                <h3 className="font-medium text-amber-800">Warning</h3>
                <p className="text-amber-700">{resetResults.warning}</p>
              </div>
            )}
            
            {resetResults?.error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                <h3 className="font-medium text-red-800">Error Details</h3>
                <p className="text-red-700">{resetResults.error}</p>
              </div>
            )}
            
            {resetResults?.data?.results && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">User Deletion Results</h3>
                <div className="text-sm">
                  <p>Total users: {resetResults.data.results.length}</p>
                  <p>Successfully deleted: {resetResults.data.results.filter((r: any) => r.success).length}</p>
                  <p>Failed deletions: {resetResults.data.results.filter((r: any) => !r.success).length}</p>
                </div>
                
                {resetResults.data.results.filter((r: any) => !r.success).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-destructive mb-1">Failed Deletions:</h4>
                    <ul className="list-disc pl-5 text-xs space-y-1">
                      {resetResults.data.results
                        .filter((r: any) => !r.success)
                        .map((r: any, i: number) => (
                          <li key={i}>{r.email || r.userId}: {r.error}</li>
                        ))}
                    </ul>
                  </div>
                )}
                
                {resetResults.data.verificationMessage && (
                  <div className="mt-4 text-sm border-t pt-2">
                    <p className={resetResults.data.verificationMessage.includes("Warning") 
                      ? "text-amber-600" 
                      : "text-green-600"}>
                      {resetResults.data.verificationMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-center text-sm text-muted-foreground">
              {resetResults?.success 
                ? "You will be redirected to the home page in a few seconds..." 
                : "Please try again or contact support if the issue persists."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetAppButton;
