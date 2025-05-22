import { useRef } from 'react';

/**
 * Hook to track save state of assessments
 */
export const useSaveTracker = () => {
  // Add a flag to track if results have been saved in the current session
  const resultsSavedRef = useRef(false);
  
  // Add a tracker to store the date when we last saved an assessment
  const lastSavedDateRef = useRef<string | null>(null);
  
  // Store the assessment ID in a ref to track which assessment we're currently viewing
  const currentAssessmentIdRef = useRef<string | null>(null);
  
  const markAsSaved = (assessmentId?: string, date?: string) => {
    resultsSavedRef.current = true;
    
    if (assessmentId) {
      currentAssessmentIdRef.current = assessmentId;
    }
    
    if (date) {
      lastSavedDateRef.current = date;
    } else {
      // Use today's date
      lastSavedDateRef.current = new Date().toISOString().split('T')[0];
    }
  };
  
  const resetSaveState = () => {
    resultsSavedRef.current = false;
    // We don't reset the last saved date or current assessment ID here
    // as those are useful to keep track of between sessions
  };
  
  return {
    isSaved: resultsSavedRef.current,
    lastSavedDate: lastSavedDateRef.current,
    currentAssessmentId: currentAssessmentIdRef.current,
    markAsSaved,
    resetSaveState
  };
};
