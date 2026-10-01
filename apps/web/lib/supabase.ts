'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      })
    : null;

export const supabaseConfigurationError = !url
  ? 'Add NEXT_PUBLIC_SUPABASE_URL to connect the Vienna catalogue.'
  : !publishableKey
    ? 'Add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to connect the Vienna catalogue.'
    : null;

export function requireSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(supabaseConfigurationError ?? 'Supabase is not configured.');
  }

  return supabase;
}
