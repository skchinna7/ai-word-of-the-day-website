import { createClient } from '@supabase/supabase-js';
import { validateEnvironment } from './envConfig';

// Validate environment on load
const envValidation = validateEnvironment();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  typeof supabaseAnonKey === 'string' &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  envValidation.isValid;

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Log configuration status
if (isSupabaseConfigured) {
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase client not initialized - check environment variables');
  if (envValidation.errors.length > 0) {
    console.error('Environment errors:', envValidation.errors);
  }
}

/**
 * Central auth check used by services
 * Safe even when Supabase is not configured
 */
export const checkAuthStatus = async () => {
  if (!isSupabaseConfigured || !supabase) {
    console.log('ℹ️ Supabase not configured - auth check skipped');
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Auth check error:', error.message);
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    if (!data.session?.user) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    return {
      isAuthenticated: true,
      user: data.session.user,
    };
  } catch (error) {
    console.error('❌ Unexpected error in auth check:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
};

/**
 * Helper to safely call Supabase methods
 * Returns null if Supabase is not configured
 */
export const safeSupabaseCall = <T,>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('⚠️ Supabase not configured - returning fallback');
    return Promise.resolve(fallback);
  }
  return fn();
};
