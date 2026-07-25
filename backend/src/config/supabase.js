import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey
);

export const supabaseAdmin = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey
);
