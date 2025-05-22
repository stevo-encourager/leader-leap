
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
    
    // First delete all profiles (if any exist)
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (profilesError) {
      console.error("Error deleting profiles:", profilesError);
      // Continue anyway as we want to delete users
    }
    
    // Get the list of all users
    const { data: users, error: getUsersError } = await supabase.auth.admin.listUsers();
    
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
    
    // Delete each user
    const deletionResults = [];
    
    for (const user of users.users) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(user.id);
        
        if (error) {
          console.error(`Error deleting user ${user.id}:`, error);
          deletionResults.push({ userId: user.id, email: user.email, success: false, error: error.message });
        } else {
          deletionResults.push({ userId: user.id, email: user.email, success: true });
        }
      } catch (err) {
        console.error(`Exception deleting user ${user.id}:`, err);
        deletionResults.push({ userId: user.id, email: user.email, success: false, error: err.message });
      }
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
