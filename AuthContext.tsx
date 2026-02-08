import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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

    console.log('✅ Supabase configured - checking session');

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Session error:', error.message);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('✅ User logged in:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
      } else {
        console.log('ℹ️ No active session');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      if (session?.user) {
        console.log('✅ User logged in:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        });
      } else {
        console.log('ℹ️ User logged out');
        setUser(null);
      }
    });

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
        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
        });
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      console.log('⚠️ Mock signup - Supabase not configured');
      setUser({
        id: 'mock-user-' + Date.now(),
        email,
        created_at: new Date().toISOString(),
      });
      return;
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
