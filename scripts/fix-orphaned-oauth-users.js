// Script to fix OAuth users who have auth records but no profiles
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findOrphanedUsers() {
  console.log('🔍 Looking for users without profiles...');
  
  // Get all auth users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return [];
  }
  
  console.log(`📊 Found ${users.length} auth users`);
  
  // Get all profile IDs
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id');
    
  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return [];
  }
  
  console.log(`📊 Found ${profiles.length} profiles`);
  
  const profileIds = new Set(profiles.map(p => p.id));
  
  // Find users without profiles
  const orphanedUsers = users.filter(user => !profileIds.has(user.id));
  
  console.log(`🚨 Found ${orphanedUsers.length} orphaned users:`);
  orphanedUsers.forEach(user => {
    console.log(`  - ${user.email} (ID: ${user.id}, Provider: ${user.app_metadata?.provider || 'email'})`);
  });
  
  return orphanedUsers;
}

async function createProfileForUser(user) {
  console.log(`\n🛠️  Creating profile for ${user.email}...`);
  
  // Extract name data from user metadata
  const rawMetadata = user.user_metadata || {};
  const fullName = rawMetadata.full_name || rawMetadata.name || '';
  const firstName = rawMetadata.first_name || 
    rawMetadata.given_name || 
    (fullName ? fullName.split(' ')[0] : '');
  const lastName = rawMetadata.last_name || 
    rawMetadata.family_name || 
    (fullName && fullName.includes(' ') ? fullName.split(' ').slice(1).join(' ') : '');
  
  const profileData = {
    id: user.id,
    email: user.email,
    full_name: fullName,
    first_name: firstName,
    surname: lastName,
    receive_emails: true,
    gdpr_consent: false, // They'll need to consent when they use the app
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log(`📝 Profile data:`, {
    email: profileData.email,
    full_name: profileData.full_name,
    first_name: profileData.first_name,
    surname: profileData.surname
  });
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
    .select();
    
  if (error) {
    console.error(`❌ Error creating profile for ${user.email}:`, error);
    return false;
  }
  
  console.log(`✅ Successfully created profile for ${user.email}`);
  return true;
}

async function fixOrphanedUsers() {
  try {
    const orphanedUsers = await findOrphanedUsers();
    
    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found!');
      return;
    }
    
    console.log(`\n🔧 Fixing ${orphanedUsers.length} orphaned users...`);
    
    let fixed = 0;
    for (const user of orphanedUsers) {
      const success = await createProfileForUser(user);
      if (success) fixed++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total orphaned users: ${orphanedUsers.length}`);
    console.log(`   Successfully fixed: ${fixed}`);
    console.log(`   Failed: ${orphanedUsers.length - fixed}`);
    
  } catch (error) {
    console.error('🚨 Script error:', error);
  }
}

// Run the script
console.log('🚀 Starting orphaned OAuth user fix script...\n');
fixOrphanedUsers();