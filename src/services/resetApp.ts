
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Delete all assessment records in the database
 */
export const deleteAllAssessmentRecords = async () => {
  try {
    console.log("Deleting all assessment records...");
    
    const { error } = await supabase
      .from('assessment_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) {
      console.error("Error deleting assessment records:", error);
      return { success: false, error: error.message };
    }
    
    console.log("All assessment records deleted successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting all assessment records:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Delete all users (This requires admin rights and is only for development/testing)
 * Note: In a real production app, this would be restricted to admin users only
 */
export const deleteAllUsers = async () => {
  try {
    console.log("Attempting to delete all users and related data...");
    
    // This is a development-only function and requires admin rights
    const { data, error } = await supabase.functions.invoke('delete-all-users', {
      body: { confirm: true }
    });
    
    if (error) {
      console.error("Error deleting users:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Users deletion response:", data);
    
    // Check if the function successfully deleted users
    if (data && data.results) {
      const successCount = data.results.filter((result: any) => result.success).length;
      const failCount = data.results.length - successCount;
      
      console.log(`Successfully deleted ${successCount} users, ${failCount} failed`);
      
      if (failCount > 0) {
        const failedUsers = data.results
          .filter((result: any) => !result.success)
          .map((result: any) => `${result.email || result.userId}: ${result.error}`)
          .join(', ');
          
        console.warn("Failed to delete some users:", failedUsers);
        
        // Return partial success if some users were deleted but others failed
        if (successCount > 0) {
          return { 
            success: true, 
            data: data, 
            warning: `${failCount} users could not be deleted. Please try again to delete remaining users.` 
          };
        }
        
        return { success: false, error: `Failed to delete users: ${failedUsers}` };
      }
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error deleting all users:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all local storage data related to the assessment
 */
export const clearLocalStorageData = () => {
  try {
    // Clear assessment data
    localStorage.removeItem('assessment_categories');
    localStorage.removeItem('assessment_demographics');
    localStorage.removeItem('assessment_timestamp');
    
    // Clear saved assessment tracking
    localStorage.removeItem('assessment_saved');
    localStorage.removeItem('assessment_id');
    localStorage.removeItem('last_saved_date');
    
    // Clear any other app-specific local storage items
    localStorage.removeItem('supabase.auth.token');
    
    // Force clear auth data from Supabase local storage
    localStorage.removeItem('sb-' + supabase.supabaseUrl + '-auth-token');
    
    console.log("Local storage cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing local storage:", error);
    return false;
  }
};

/**
 * Reset the entire application (database and local storage)
 * For development/testing purposes only
 */
export const resetAppData = async () => {
  try {
    // 1. Clear local storage first
    clearLocalStorageData();
    
    // 2. Delete all assessment records
    const assessmentsResult = await deleteAllAssessmentRecords();
    if (!assessmentsResult.success) {
      toast({
        title: "Error deleting assessments",
        description: assessmentsResult.error || "Failed to delete assessment records",
        variant: "destructive",
      });
      return { success: false, error: assessmentsResult.error };
    }
    
    // 3. Delete all users
    const usersResult = await deleteAllUsers();
    if (!usersResult.success) {
      toast({
        title: "Error deleting users",
        description: usersResult.error || "Failed to delete users",
        variant: "destructive",
      });
      return { success: false, error: usersResult.error };
    }
    
    // Check for partial success with warnings
    if (usersResult.warning) {
      toast({
        title: "Partial reset completed",
        description: usersResult.warning,
        variant: "warning",
      });
      
      return { success: true, warning: usersResult.warning };
    }
    
    // Success
    toast({
      title: "App data reset complete",
      description: "All users, assessments, and local data have been deleted",
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Error resetting app data:", error);
    toast({
      title: "Error resetting app data",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return { success: false, error: error.message };
  }
};
