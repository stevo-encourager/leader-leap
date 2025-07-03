const fs = require('fs');
console.log("Does .env exist?", fs.existsSync('.env'));
console.log("Contents of .env:\n", fs.readFileSync('.env', 'utf8'));

console.log("Script started")
require('dotenv').config();
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY (first 10 chars):", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10));
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);


async function backfillProfiles() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }

  let created = 0;
  for (const user of users.users) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!profile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        receive_emails: user.user_metadata?.receive_emails ?? null,
      });
      if (!insertError) created++;
    }
  }
  console.log(`Backfill complete. Profiles created: ${created}`);
}

async function main() {
  await backfillProfiles();
}

main();