import * as Linking from 'expo-linking';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function currentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function watchAuth(callback: (user: User | null) => void) {
  if (!supabase) return () => undefined;
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user ?? null));
  return () => data.subscription.unsubscribe();
}

export async function sendMagicLink(email: string) {
  if (!supabase) throw new Error('Add the Supabase public URL and key to enable email sign-in.');
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: Linking.createURL('auth') } });
  if (error) throw error;
}

export async function completeAuthRedirect(url: string) {
  if (!supabase) return;
  const code = new URL(url).searchParams.get('code');
  if (!code) return;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function signOut() { if (supabase) await supabase.auth.signOut(); }
