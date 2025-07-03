console.log("Script started")
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hrgoxcdixvpmcbfgltea.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZ294Y2RpeHZwbWNiZmdsdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODMxMTQsImV4cCI6MjA2MzA1OTExNH0.5FtaIZBVaUnwrQjIEslDlStE3-T0TqxKdHvsZglM24o'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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