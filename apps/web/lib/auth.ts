'use client';

import { createClient, type User } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null;

export async function currentUser(): Promise<User | null> {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export function watchAuth(callback: (user: User | null) => void) {
  if (!client) return () => undefined;
  const { data } = client.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
  return () => data.subscription.unsubscribe();
}

export async function sendMagicLink(email: string) {
  if (!client) throw new Error('Add your Supabase public URL and key to enable email sign-in.');
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  if (error) throw error;
}

export async function signOut() {
  if (client) await client.auth.signOut();
}
