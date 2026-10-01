import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';
import { createChunkedStorage } from './chunked-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurationError = !url || !/^https:\/\//.test(url)
  ? 'SheHungry is missing its secure connection settings. Please contact the beta organiser.'
  : !publishableKey || publishableKey.startsWith('sb_secret_')
    ? 'SheHungry is missing its public connection key. Please contact the beta organiser.'
    : null;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  keychainService: 'shehungry.supabase.auth',
};

const secureStorage = createChunkedStorage({
  getItem: (key: string) => SecureStore.getItemAsync(key, secureStoreOptions),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value, secureStoreOptions),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key, secureStoreOptions),
});

const browserStorage = {
  getItem: async (key: string) => typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
  setItem: async (key: string, value: string) => { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); },
  removeItem: async (key: string) => { if (typeof localStorage !== 'undefined') localStorage.removeItem(key); },
};

// A guest session is still an authenticated Supabase user. Keeping it in the
// platform keychain lets people retain their swipes without exposing tokens in
// ordinary app storage or requiring an account up front.
export const supabase = !supabaseConfigurationError && url && publishableKey
  ? createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storage: Platform.OS === 'web' ? browserStorage : secureStorage,
      },
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  if (AppState.currentState === 'active') supabase.auth.startAutoRefresh();
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
