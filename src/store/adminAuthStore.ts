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
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Failed to get session:', sessionError.message);
        set({ isLoading: false });
        return;
      }

      const session = data.session;
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Failed to fetch profile:', profileError.message);
          set({ isLoading: false });
          return;
        }

        if (profile?.role === 'admin') {
          set({ admin: session.user, session, isAuthenticated: true });
        } else {
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Failed to fetch profile on auth change:', profileError.message);
          set({ admin: null, session: null, isAuthenticated: false });
          return;
        }

        if (profile?.role === 'admin') {
          set({ admin: session.user, session, isAuthenticated: true });
        } else {
          await supabase.auth.signOut();
          set({ admin: null, session: null, isAuthenticated: false });
        }
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      return { error: new Error(`Failed to fetch profile: ${profileError.message}`) };
    }

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      return { error: new Error('Access denied. Admin accounts only.') };
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
