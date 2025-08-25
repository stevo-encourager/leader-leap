import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Debug environment variables
console.log('=== SUPABASE ENV DEBUG ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('All env vars with SUPABASE:', Object.keys(import.meta.env).filter(key => key.includes('SUPABASE')));
console.log('Environment mode:', import.meta.env.MODE);
console.log('================================');

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Missing environment variables:');
  console.error('SUPABASE_URL:', SUPABASE_URL);
  console.error('SUPABASE_PUBLISHABLE_KEY:', SUPABASE_PUBLISHABLE_KEY);
  throw new Error('Missing required Supabase environment variables');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);