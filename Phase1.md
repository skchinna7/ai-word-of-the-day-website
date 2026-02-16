import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
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
  console.log('✅ Supabase configured - checking session');
} else {
  console.log('❌ Supabase not configured - using mock mode');
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user for development when Supabase is not configured
const mockAdminUser: User = {
  id: 'mock-admin-id',
  email: 'admin@wotd.in',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // Use mock user when Supabase is not configured
      console.log('⚠️ Supabase not configured - authentication disabled');
      setLoading(false);
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          console.log('✅ User authenticated:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          });
        } else {
          console.log('ℹ️ User logged out');
          setUser(null);
        }
      }
    );

    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          });
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('⚠️ Mock login - Supabase not configured');
      // Auto-login as admin for demo purposes
      if (email === 'admin@wotd.in' || email === 'admin@wordofday.com') {
        setUser(mockAdminUser);
        return;
      }
      throw new Error('Supabase is not configured. Please set up environment variables.');
    }

    console.log('🔐 Attempting login for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email);
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please set up environment variables.');
    }

    console.log('📝 Attempting signup for:', email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signup error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Signup successful:', data.user.email);
        
        // Create user profile
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: data.user.id,
          notifications_enabled: true,
          email_notifications: true,
          daily_word_email: true,
          weekly_digest: false,
          achievement_alerts: true,
          system_updates: true,
          profile_visibility: 'public',
          show_learning_stats: true,
          allow_data_collection: true,
        });

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
        } else {
          console.log('✅ User profile created');
        }

        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
        });
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('⚠️ Mock logout');
      setUser(null);
      return;
    }

    console.log('👋 Logging out');
    await supabase.auth.signOut();
    setUser(null);
  };

  // Admin check - allow admin@wotd.in and admin@wordofday.com
  const isAdmin = user?.email === 'admin@wotd.in' || user?.email === 'admin@wordofday.com';

  console.log('🔍 Current user:', user?.email, '| Is admin:', isAdmin);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Environment Configuration Validator
// This file helps debug environment variable issues

export const getEnvConfig = () => {
  const config = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  };

  // Log configuration status (without exposing sensitive data)
  console.log('🔧 Environment Configuration Check:');
  console.log('  Supabase URL:', config.supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('  Supabase Key:', config.supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('  OpenAI Key:', config.openaiApiKey ? '✅ Set' : '❌ Missing');

  // Validate Supabase URL format
  if (config.supabaseUrl && !config.supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid Supabase URL format. Should start with https://');
  }

  // Validate Supabase Key format
  if (config.supabaseAnonKey && !config.supabaseAnonKey.startsWith('eyJ')) {
    console.error('❌ Invalid Supabase Key format. Should start with eyJ');
  }

  return config;
};

export const validateEnvironment = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const config = getEnvConfig();

  if (!config.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not set');
  } else if (!config.supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://');
  }

  if (!config.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not set');
  } else if (!config.supabaseAnonKey.startsWith('eyJ')) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid (should start with eyJ)');
  }

  if (errors.length > 0) {
    console.error('❌ Environment validation failed:', errors);
  } else {
    console.log('✅ Environment validation passed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

