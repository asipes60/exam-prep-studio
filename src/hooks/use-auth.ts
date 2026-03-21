import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s. Check your connection or try again.`)), ms)
    ),
  ]);
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferredLicense: string | null;
  subscriptionStatus: 'free' | 'pro' | 'cancelled';
  dailyGenerations: number;
  dailyGenerationsResetAt: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await withTimeout(
    supabase
      .from('profiles')
      .select('id, email, name, preferred_license, subscription_status, daily_generations, daily_generations_reset_at, is_admin')
      .eq('id', userId)
      .single(),
    8000,
    'Profile fetch'
  );

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    preferredLicense: data.preferred_license,
    subscriptionStatus: data.subscription_status as 'free' | 'pro' | 'cancelled',
    dailyGenerations: data.daily_generations,
    dailyGenerationsResetAt: data.daily_generations_reset_at,
    isAdmin: (data as any).is_admin ?? false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function handleSession(newSession: Session | null) {
      if (cancelled) return;
      setSession(newSession);
      if (newSession?.user) {
        try {
          const profile = await fetchProfile(newSession.user.id);
          if (!cancelled) {
            console.log('[Auth] Profile loaded:', profile?.email);
            setUser(profile);
          }
        } catch {
          if (!cancelled) setUser(null);
        }
      } else {
        setUser(null);
      }
      if (!cancelled) setLoading(false);
    }

    // Subscribe first for real-time auth changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] Event:', event, newSession ? 'has session' : 'no session');
        handleSession(newSession);
      }
    );

    // Explicitly fetch session — the lock bypass can cause INITIAL_SESSION to fire
    // before the listener is attached, so we also read the session directly.
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('[Auth] getSession:', currentSession ? 'has session' : 'no session');
      handleSession(currentSession);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    // Safety timeout in case everything stalls
    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('[Auth] Timeout — forcing loaded state');
        setLoading(false);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await withTimeout(
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      }),
      10000,
      'Sign up'
    );
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      10000,
      'Sign in'
    );
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: !!session && !!user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
    }),
    [user, session, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
