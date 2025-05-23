
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client with the service role key (admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    // Parse the request body safely
    let requestBody;
    try {
      const bodyText = await req.text();
      requestBody = bodyText ? JSON.parse(bodyText) : {};
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      requestBody = {}; // Default to empty object if parsing fails
    }
    
    const { confirm } = requestBody;
    
    // Safety check to prevent accidental calls
    if (!confirm) {
      return new Response(
        JSON.stringify({ success: false, error: "Confirmation required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // First delete all assessment records explicitly to ensure clean removal
    console.log("Deleting all assessment_results records...");
    const { error: assessmentError } = await supabase
      .from('assessment_results')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (assessmentError) {
      console.error("Error deleting assessment records:", assessmentError);
      // Continue anyway as we want to delete users
    } else {
      console.log("Successfully deleted all assessment_results records");
    }
    
    // Delete all profiles (if any exist)
    console.log("Deleting all profiles records...");
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (profilesError) {
      console.error("Error deleting profiles:", profilesError);
      // Continue anyway as we want to delete users
    } else {
      console.log("Successfully deleted all profiles records");
    }
    
    // Get the list of all users
    console.log("Fetching all users...");
    const { data: users, error: getUsersError } = await supabase.auth.admin.listUsers({
      perPage: 1000, // Maximum allowed to ensure we get all users
    });
    
    if (getUsersError) {
      console.error("Error listing users:", getUsersError);
      return new Response(
        JSON.stringify({ success: false, error: getUsersError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // No users found
    if (!users || users.users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to delete" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${users.users.length} users to delete`);
    
    // Delete each user - FORCE HARD DELETE
    const deletionResults = [];
    let failedDeletions = 0;
    
    for (const user of users.users) {
      try {
        console.log(`Attempting to delete user ${user.id} (${user.email})`);
        
        // Explicitly use hard delete (shouldSoftDelete: false) to ensure complete removal
        const { error } = await supabase.auth.admin.deleteUser(user.id, {
          shouldSoftDelete: false // Ensure hard deletion
        });
        
        if (error) {
          console.error(`Error deleting user ${user.id}:`, error);
          failedDeletions++;
          deletionResults.push({ userId: user.id, email: user.email, success: false, error: error.message });
          
          // Second attempt with different approach if first fails
          console.log(`Retrying deletion of user ${user.id} with different approach...`);
          const secondAttempt = await supabase.auth.admin.deleteUser(user.id);
          
          if (secondAttempt.error) {
            console.error(`Second attempt failed for user ${user.id}:`, secondAttempt.error);
          } else {
            console.log(`Second attempt succeeded for user ${user.id}`);
            deletionResults[deletionResults.length - 1].success = true;
            deletionResults[deletionResults.length - 1].error = "Deleted on second attempt";
            failedDeletions--;
          }
        } else {
          console.log(`Successfully deleted user ${user.id} (${user.email})`);
          deletionResults.push({ userId: user.id, email: user.email, success: true });
        }
      } catch (err) {
        failedDeletions++;
        console.error(`Exception deleting user ${user.id}:`, err);
        deletionResults.push({ userId: user.id, email: user.email, success: false, error: err.message });
      }
      
      // Small delay between deletions to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Verify all users were deleted by checking again
    const { data: remainingUsers, error: verifyError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    
    let verificationMessage = "";
    if (verifyError) {
      verificationMessage = `Unable to verify deletion: ${verifyError.message}`;
    } else {
      verificationMessage = remainingUsers && remainingUsers.users.length > 0 
        ? `Warning: ${remainingUsers.users.length} users still remain after deletion` 
        : "Verification successful: No users remain";
    }
    
    return new Response(
      JSON.stringify({
        success: failedDeletions === 0,
        message: "User deletion process completed",
        totalUsers: users.users.length,
        failedDeletions,
        verificationMessage,
        results: deletionResults
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Error in delete-all-users function:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
