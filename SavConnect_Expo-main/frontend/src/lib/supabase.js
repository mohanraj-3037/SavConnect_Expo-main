import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// On web, Supabase must use localStorage (the default).
// On native, it uses AsyncStorage for persistent sessions.
// Passing AsyncStorage on web causes silent auth failures.
const authStorage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:          authStorage,
    persistSession:   Platform.OS !== 'web', // Force web to always start at Login
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web', // needed on web for OAuth redirects
  },
});
