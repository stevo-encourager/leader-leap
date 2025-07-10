const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixEmailPreferences() {
  console.log('Starting email preferences fix...');
  
  try {
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} users`);
    
    for (const user of users.users) {
      console.log(`Processing user: ${user.email}`);
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, receive_emails')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error(`Error fetching profile for ${user.email}:`, profileError);
        continue;
      }
      
      // Get email preference from user metadata
      const receiveEmails = user.user_metadata?.receive_emails;
      console.log(`User ${user.email} metadata receive_emails:`, receiveEmails);
      
      if (profile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            receive_emails: receiveEmails === true ? true : false 
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`Error updating profile for ${user.email}:`, updateError);
        } else {
          console.log(`✅ Updated profile for ${user.email} with receive_emails: ${receiveEmails === true ? true : false}`);
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            receive_emails: receiveEmails === true ? true : false
          });
        
        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError);
        } else {
          console.log(`✅ Created profile for ${user.email} with receive_emails: ${receiveEmails === true ? true : false}`);
        }
      }
    }
    
    console.log('Email preferences fix completed!');
    
  } catch (error) {
    console.error('Error in fixEmailPreferences:', error);
  }
}

// Run the fix
fixEmailPreferences(); 