
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Create a Supabase client with the service role key (admin privileges)
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  
  try {
    // Parse the request body
    const { confirm } = await req.json();
    
    // Safety check to prevent accidental calls
    if (!confirm) {
      return new Response(
        JSON.stringify({ success: false, error: "Confirmation required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
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
        { headers: { "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // No users found
    if (!users || users.users.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No users to delete" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Found ${users.users.length} users to delete`);
    
    // Delete each user
    const deletionResults = [];
    
    for (const user of users.users) {
      try {
        console.log(`Attempting to delete user ${user.id} (${user.email})`);
        const { error } = await supabase.auth.admin.deleteUser(user.id, {
          shouldSoftDelete: false // Ensure hard deletion
        });
        
        if (error) {
          console.error(`Error deleting user ${user.id}:`, error);
          deletionResults.push({ userId: user.id, email: user.email, success: false, error: error.message });
        } else {
          console.log(`Successfully deleted user ${user.id} (${user.email})`);
          deletionResults.push({ userId: user.id, email: user.email, success: true });
        }
      } catch (err) {
        console.error(`Exception deleting user ${user.id}:`, err);
        deletionResults.push({ userId: user.id, email: user.email, success: false, error: err.message });
      }
      
      // Small delay between deletions to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "User deletion process completed",
        totalUsers: users.users.length,
        results: deletionResults
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (err) {
    console.error("Error in delete-all-users function:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
