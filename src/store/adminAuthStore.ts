import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  admin: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session?.user) {
        set({ admin: session.user, session, isAuthenticated: true });
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ admin: session.user, session, isAuthenticated: true });
      } else {
        set({ admin: null, session: null, isAuthenticated: false });
      }
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: new Error('Sign-in succeeded but no user was returned.') };
    }

    set({
      admin: data.user,
      session: data.session,
      isAuthenticated: true,
    });

    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ admin: null, session: null, isAuthenticated: false });
  },
}));
